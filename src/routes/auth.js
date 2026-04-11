





// const express = require("express");
// const crypto = require("crypto");
// const User = require("../models/user");
// const { validateSignUpData } = require("../utils/validation");

// const authRouter = express.Router();

// /* ================= SIGNUP ================= */
// authRouter.post("/signup", async (req, res) => {
//   try {
//     validateSignUpData(req);

//     const { firstName, lastName, emailId, password, gender, skills,age,about,photo } = req.body;

//     const existingUser = await User.findOne({ emailId });
//     if (existingUser) {
//       return res.status(400).json({ message: "Email already exists" });
//     }

//     const user = new User({
//       firstName,
//       lastName,
//       emailId,
//       password,
//       gender,
//       skills,
//       age,
//       about,
//       photo,
//     });

//     await user.save();

//     // ✅ Auto Login after signup
//     const token = user.generateAuthToken();

//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         _id: user._id,
//         firstName: user.firstName,
//         emailId: user.emailId,
//       },
//     });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// /* ================= LOGIN ================= */
// authRouter.post("/login", async (req, res) => {
//   try {
//     const { emailId, password } = req.body;

//     const user = await User.findOne({ emailId }).select("+password");

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isValid = await user.verifyPassword(password);

//     if (!isValid) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = user.generateAuthToken();

//     res.cookie("token", token, {
//       httpOnly: true,
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         _id: user._id,
//         firstName: user.firstName,
//         emailId: user.emailId,
//         photo: user.photo,
//       },
//     });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// /* ================= LOGOUT ================= */
// authRouter.post("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.status(200).json({ message: "Logged out successfully" });
// });

// /* ================= FORGOT PASSWORD ================= */
// authRouter.post("/forgot-password", async (req, res) => {
//   try {
//     const { emailId } = req.body;

//     const user = await User.findOne({ emailId });
//     if (!user) {
//       return res.status(400).json({ message: "User not found" });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");

//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

//     await user.save();

//     // TODO: Send email here
//     console.log("RESET TOKEN:", resetToken);

//     res.status(200).json({
//       message: "Password reset link sent to email",
//     });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// /* ================= RESET PASSWORD ================= */
// authRouter.post("/reset-password/:token", async (req, res) => {
//   try {
//     const { newPassword } = req.body;
//     const { token } = req.params;

//     if (!newPassword) {
//       return res.status(400).json({ message: "Password is required" });
//     }

//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpiry: { $gt: Date.now() },
//     }).select("+password");

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.password = newPassword; // will auto hash via pre("save")
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpiry = undefined;

//     await user.save();

//     res.status(200).json({
//       message: "Password reset successfully",
//     });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// module.exports = authRouter;



const express = require("express");
const crypto = require("crypto");
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");

const authRouter = express.Router();

/* ================= SIGNUP ================= */
authRouter.post("/signup", async (req, res) => {
  try {
    // 1. Validate the incoming data
    validateSignUpData(req);

    // 🛠️ Changed 'photo' to 'photoUrl' in the destructuring
    const {
      firstName, lastName, emailId, password,
      gender, skills, age, about, photoUrl
    } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2. Create the new user with the correct field name
    const user = new User({
      firstName,
      lastName,
      emailId,
      password,
      gender,
      skills,
      age,
      about,
      photoUrl, // 🛠️ Matches the Schema field name
    });

    await user.save();

    // 3. Generate Token for Auto-Login
    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    // 4. Send the FULL user object (including photoUrl) to the frontend
    res.status(201).json({
      message: "User registered successfully",
      user: user, // ✅ Sending the whole object ensures Redux gets photoUrl, about, etc.
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


/* ================= LOGIN ================= */
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Find user and explicitly include password for verification
    const user = await User.findOne({ emailId }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await user.verifyPassword(password);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Sending the full 'user' object so NavBar, Profile, etc., all have data
    res.status(200).json({
      message: "Login successful",
      user: user,
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ================= LOGOUT ================= */
authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

/* ================= FORGOT/RESET PASSWORD (UNTOUCHED) ================= */
// ... (keep your existing forgot/reset password logic here)

module.exports = authRouter;