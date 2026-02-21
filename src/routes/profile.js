const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const User = require("../models/user");
/* ================= PROFILE ================= */

//   try {
//     const user = req.user; // auth middleware se aaya hua

//     res.status(200).json({
//       message: "My profile fetched successfully ✅",
//       data: {
//         _id: user._id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         emailId: user.emailId,
//         gender: user.gender,
//         skills: user.skills,
//         bio: user.bio,
//         photo: user.photo,
//         createdAt: user.createdAt,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

profileRouter.get("/profile/me", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      message: "Profile fetched successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        gender: user.gender,
        skills: user.skills,
        photo: user.photo,
        about: user.about,
        createdAt: user.createdAt
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});


//   try {
//     const user = req.user;

//     const safeUser = {
//       id: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       emailId: user.emailId,
//       age: user.age,
//       gender: user.gender,
//       skills: user.skills,
//       photo: user.photo,
//       createdAt: user.createdAt
//     };

//     res.status(200).json({
//       message: "Profile fetched successfully",
//       data: safeUser
//     });

//   } catch (err) {
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });

/* ================= FEED ================= */

profileRouter.get("/feed", userAuth, async (req, res) => {
  const users = await User.find({});
  res.send(users);
});


// Edit my profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    validateEditProfileData(req);

    const user = req.user;
    const updates = req.body;

    // age only once
    if (updates.age !== undefined) {
      if (!user.isAgeEditable) {
        throw new Error("Age can be edited only once");
      }
      user.age = updates.age;
      user.isAgeEditable = false;
    }

    Object.keys(updates).forEach((key) => {
      if (key !== "age") {
        user[key] = updates[key];
      }
    });

    await user.save();


    res.status(200).send("Profile updated successfully");

  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = profileRouter;