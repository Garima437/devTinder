const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [20, "First name cannot exceed 20 characters"],
        trim: true,
        validate: {
            validator: (value) => /^[A-Za-z]+$/.test(value),
            message: "First name must contain only letters"
        }
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        minlength: [2, "Last name must be at least 2 characters"],
        maxlength: [20, "Last name cannot exceed 20 characters"],
        trim: true,
        validate: {
            validator: (value) => /^[A-Za-z]+$/.test(value),
            message: "Last name must contain only letters"
        }
    },
    age: {
        type: Number,
        min: [18, "Age must be at least 18"],
        max: [60, "Age cannot exceed 60"],
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Invalid email"
        }
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false // Crucial: Prevents password leak in API responses
    },
    photoUrl: {
        type: String,
        trim: true,
        default: "https://i.ibb.co/dsB9Zw6C/profil-jpg.png",
        validate: {
            validator: (value) => validator.isURL(value),
            message: "Photo must be a valid URL"
        }
    },
    photos: {
        type: [String],
        default: [],
        validate: [
            {
                validator: (arr) => arr.length <= 6, // Tinder-style 6 photos
                message: "You can upload max 6 photos"
            },
            {
                validator: (arr) => arr.every(url => validator.isURL(url)),
                message: "Each photo must be a valid URL"
            }
        ]
    },
    about: {
        type: String,
        maxlength: [300, "About section cannot exceed 300 characters"]
    },
    skills: {
        type: [String],
        required: true,
        validate: [
            {
                validator: (arr) => Array.isArray(arr) && arr.length >= 1,
                message: "At least one skill is required"
            },
            {
                validator: (arr) => arr.length <= 10,
                message: "You can add max 10 skills"
            }
        ]
    },
    membership: {
  plan: {
    type: String,
    enum: ["free", "silver", "gold"],
    default: "free"
  },
  expiryDate: {
    type: Date
  }
},
    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: {
            values: ["male", "female", "other"],
            message: "Gender must be male, female, or other"
        },
        lowercase: true,
        trim: true
    }
}, { timestamps: true });

/** * ✅ FIX: Removed 'next' parameter.
 * Mongoose handles async/await automatically without it.
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    // Only hash the password if it is new or being changed
    this.password = await bcrypt.hash(this.password, 10);
});

/**
 * ✅ Methods use 'function' keyword to keep 'this' context
 */
userSchema.methods.verifyPassword = async function (plainPassword) {
    // Since 'password' is 'select: false', ensure it's available in the doc
    return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = mongoose.model("User", userSchema);