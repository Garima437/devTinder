const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const Message = require("../models/message"); // ✅ ADD THIS: Needed for unmatch logic
const User = require("../models/user");
const { sendConnectionRequestEmail } = require("../utils/sendEmail");
console.log("Request router loaded");

/* ================= SEND REQUEST ================= */
requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    if (!["interested", "ignored"].includes(status)) {
      return res.status(400).send("Invalid action");
    }

    if (fromUserId.equals(toUserId)) {
      return res.status(400).send("Cannot send request to yourself");
    }

    const existing = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).send("Already matched");
      }
      return res.status(400).send("Request already exists");
    }


    if (status === "interested") {
      const reverse = await ConnectionRequest.findOne({
        fromUserId: toUserId,
        toUserId: fromUserId,
        status: "interested"
      });

      if (reverse) {
        reverse.status = "accepted";
        await reverse.save();
        return res.json({ message: "🎉 It's a Match!" });
      }
    }

await ConnectionRequest.create({ fromUserId, toUserId, status });

if (status === "interested") {
  try {
    const toUser = await User.findById(toUserId).select("firstName emailId");
    const fromUser = await User.findById(fromUserId).select("firstName"); 
    await sendConnectionRequestEmail({
      toEmail: toUser.emailId,
      toName: toUser.firstName,
      fromName: fromUser.firstName,
    });
  } catch (emailErr) {
    console.error("Email notification failed:", emailErr.message);
  }
}

res.json({
  message: status === "interested" ? "Request sent" : "User ignored"
});
  } catch (err) {
    res.status(500).send("Server error");
  }
});

/* ================= REVIEW REQUEST ================= */
requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updatedRequest = await ConnectionRequest.findOneAndUpdate(
      {
        _id: requestId,
        toUserId: req.user._id,
        status: "interested",
      },
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found or already handled" });
    }

    return res.status(200).json({
      message: status === "accepted" ? "🎉 Match successful" : "Request rejected",
      requestId: updatedRequest._id,
      status: updatedRequest.status,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET RECEIVED REQUESTS ================= */
requestRouter.get("/received", userAuth, async (req, res) => {
  try {
    const connectionRequests = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: "interested",
    }).populate("fromUserId", "firstName lastName photoUrl age gender about skills");

    res.json({
      message: "Requests fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

/* ================= UNMATCH ================= */
requestRouter.delete("/unmatch/:connectionId", userAuth, async (req, res) => {
  try {
    const { connectionId } = req.params;

    // 1. Delete the connection
    const deletedConn = await ConnectionRequest.findByIdAndDelete(connectionId);

    if (!deletedConn) {
        return res.status(404).json({ message: "Connection not found" });
    }

    // 2. Delete all messages associated with this match
    // Ensure 'connectionId' in your Message model is indexed for performance
    await Message.deleteMany({ connectionId });

    res.json({ message: "Unmatched successfully" });
  } catch (err) {
    res.status(500).json({ message: "Could not unmatch user" });
  }
});

module.exports = requestRouter;
