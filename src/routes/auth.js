const express =require("express");
const authRouter=express.Router();
const crypto = require("crypto");

const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
// SIGNUP
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password, gender, skills } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const user = new User({
      firstName,
      lastName,
      emailId,
      password,
      gender,
      skills,
    });

    await user.save();

    res.send("User registered successfully ");

  } catch (err) {
    res.status(400).send(err.message);
  }
});

// LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.send("Login successful ");

  } catch (err) {
    res.status(400).send(err.message);
  }
});

/* ================= LOGOUT ================= */
authRouter.post("/logout", userAuth, (req, res) => {
  res.clearCookie("token");
  res.send("Logged out successfully ");
});
// forgot and reset password
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User not found");
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    // later email service
    console.log("RESET TOKEN:", token);

    res.status(200).send("Password reset link sent to email");
  } catch (err) {
    res.status(400).send(err.message);
  }
});
// RESET - PASSWORD
authRouter.post("/reset-password/:token", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.status(200).send("Password reset successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = authRouter;