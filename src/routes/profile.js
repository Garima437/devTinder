const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const User = require("../models/user");
const cloudinary = require("../utils/cloudinary");
const upload = require("../middlewares/upload");
const fs = require("fs"); // ✅ ADD THIS: Needed for local file cleanup

/* ================= PROFILE GET ================= */
profileRouter.get("/profile/me", userAuth, async (req, res) => {
    try {
        const user = req.user;
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
        validateEditProfileData(req);

        const user = req.user;
        const updates = req.body;

        if (updates.age !== undefined) {
            if (user.isAgeEditable === false) {
                return res.status(400).send("Age can be edited only once");
            }
            user.age = updates.age;
            user.isAgeEditable = false;
        }

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
    upload.single("photo"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const result = await cloudinary.uploader.upload(req.file.path);

            // ✅ CLEANUP: Delete local file from AWS disk after Cloudinary upload
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            const user = req.user;
            user.photoUrl = result.secure_url;

            await user.save();

            res.status(200).json({
                message: "Photo uploaded successfully",
                photoUrl: result.secure_url,
            });

        } catch (err) {
            // ✅ Safety cleanup if Cloudinary fails
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(500).json({ message: err.message });
        }
    }
);

// ✅ MAKE SURE THIS LINE EXISTS AT THE VERY END
module.exports = profileRouter;