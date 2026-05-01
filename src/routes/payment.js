const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { userAuth } = require("../middlewares/auth");
const Membership = require("../models/Membership");
// CORRECT
const User = require("../models/user");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Plan details
const PLANS = {
  silver: {
    amount: 9900,    // Rs 99 in paise
    duration: 30,    // 30 days
    name: "DevTinder Silver"
  },
  gold: {
    amount: 19900,   // Rs 199 in paise
    duration: 30,    // 30 days
    name: "DevTinder Gold"
  }
};

// ─── ROUTE 1: Create Order ───────────────────────────
router.post("/payment/create-order", userAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const options = {
      amount: PLANS[plan].amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan: plan
      }
    };

    const order = await razorpay.orders.create(options);

    // Save order in DB
    await Membership.create({
      userId: req.user._id,
      plan: plan,
      orderId: order.id,
      amount: PLANS[plan].amount
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: plan,
      planName: PLANS[plan].name
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ROUTE 2: Verify Payment ─────────────────────────
router.post("/payment/verify", userAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // Find membership record
    const membership = await Membership.findOne({
      orderId: razorpay_order_id
    });

    if (!membership) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Calculate expiry
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() +
      (membership.plan === "gold" ? 30 : 30));

    // Update membership
    await Membership.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        status: "paid",
        startDate,
        endDate
      }
    );

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      "membership.plan": membership.plan,
      "membership.expiryDate": endDate
    });

    res.json({
      success: true,
      message: `${membership.plan} membership activated!`,
      expiryDate: endDate
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ROUTE 3: Get Membership Status ──────────────────
router.get("/payment/membership", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("membership");

    res.json({
      plan: user.membership?.plan || "free",
      expiryDate: user.membership?.expiryDate || null,
      isActive: user.membership?.expiryDate > new Date()
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;