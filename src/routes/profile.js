





// const express = require("express");
// const profileRouter = express.Router();
// const { userAuth } = require("../middlewares/auth");
// const { validateEditProfileData } = require("../utils/validation");
// const User = require("../models/user");
// const cloudinary = require("../utils/cloudinary");
// const upload = require("../middlewares/upload");

// /* ================= PROFILE GET ================= */

// profileRouter.get("/profile/me", userAuth, async (req, res) => {
//   try {
//     const user = req.user;
//     // We send back only what's necessary
//     res.status(200).json({
//       message: "Profile fetched successfully",
//       data: user
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });

// /* ================= PROFILE EDIT ================= */

// profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
//   try {
//     // 1. Validate (Prevents changing email/password here)
//     validateEditProfileData(req);

//     const user = req.user;
//     const updates = req.body;

//     // 2. Age locking logic
//     if (updates.age !== undefined) {
//       if (user.isAgeEditable === false) {
//         throw new Error("Age can be edited only once");
//       }
//       user.age = updates.age;
//       user.isAgeEditable = false;
//     }

//     // 3. Update other fields
//     const allowedFields = ["firstName", "lastName", "gender", "skills", "about", "photo"];
//     Object.keys(updates).forEach((key) => {
//       if (allowedFields.includes(key)) {
//         user[key] = updates[key];
//       }
//     });

//     await user.save();

//     res.status(200).json({
//       message: `${user.firstName}, your profile was updated successfully ✅`,
//       data: user,
//     });

//   } catch (err) {
//     res.status(400).send(err.message);
//   }
// });

// /* ================= PHOTO UPLOAD ================= */

// profileRouter.post(
//   "/profile/upload-photo",
//   userAuth,
//   upload.single("photo"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//       }

//       // Upload to Cloudinary
//       const result = await cloudinary.uploader.upload(req.file.path);

//       // Save URL in DB
//       const user = req.user;
//       user.photo = result.secure_url; // Ensure this matches your Schema!

//       await user.save();

//       res.status(200).json({
//         message: "Photo uploaded successfully",
//         photo: result.secure_url,
//       });

//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   }
// );

// module.exports = profileRouter;


const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const User = require("../models/user");
const cloudinary = require("../utils/cloudinary");
const upload = require("../middlewares/upload");

/* ================= PROFILE GET ================= */
profileRouter.get("/profile/me", userAuth, async (req, res) => {
  try {
    const user = req.user;

    // Security: Convert to object and remove password before sending to frontend
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: "Profile fetched successfully",
      data: userData
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

/* ================= PROFILE EDIT ================= */
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // 1. Validate (Prevents changing email/password here)
    validateEditProfileData(req);

    const user = req.user;
    const updates = req.body;

    // 2. Age locking logic
    if (updates.age !== undefined) {
      if (user.isAgeEditable === false) {
        return res.status(400).send("Age can be edited only once");
      }
      user.age = updates.age;
      user.isAgeEditable = false;
    }

    // 3. Update other fields (FIXED: changed "photo" to "photoUrl")
    const allowedFields = ["firstName", "lastName", "gender", "skills", "about", "photoUrl"];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        user[key] = updates[key];
      }
    });

    await user.save();

    res.status(200).json({
      message: `${user.firstName}, your profile was updated successfully ✅`,
      data: user,
    });

  } catch (err) {
    res.status(400).send(err.message);
  }
});

/* ================= PHOTO UPLOAD ================= */
profileRouter.post(
  "/profile/upload-photo",
  userAuth,
  upload.single("photo"), // Keep "photo" here as it matches your form-data key
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      // Save URL in DB (FIXED: changed .photo to .photoUrl)
      const user = req.user;
      user.photoUrl = result.secure_url;

      await user.save();

      res.status(200).json({
        message: "Photo uploaded successfully",
        photoUrl: result.secure_url,
      });

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = profileRouter;