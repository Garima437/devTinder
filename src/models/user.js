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
        validator: function (value) {
            return /^[A-Za-z]+$/.test(value);
        },
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
        validator: function (value) {
            return /^[A-Za-z]+$/.test(value);
        },
        message: "Last name must contain only letters"
    }
},
age: {
  type: Number,
  min: [18, "Age must be at least 18"],
  max: [60, "Age cannot exceed 60"],
},

isAgeEditable: {
  type: Boolean,
  default: true,
  select:false
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
    validate: {
        validator: function (value) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
        },
        message:
          "Password must contain uppercase, lowercase, number and special character"
    },
    select: false
},


    photo: {
    type: String,
    trim: true,
    default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    validate: {
        validator: function (value) {
            return validator.isURL(value, {
                protocols: ["http", "https"],
                require_protocol: true
            });
        },
        message: "Photo must be a valid URL"
    }
},


   photos: {
  type: [String],
  default: [],
  validate: [
    {
      validator: function (arr) {
        return arr.length <= 5;
      },
      message: "You can upload max 5 photos"
    },
    {
      validator: function (arr) {
        return arr.every(url =>
          validator.isURL(url, {
            protocols: ["http", "https"],
            require_protocol: true
          })
        );
      },
      message: "Each photo must be a valid URL"
    }
  ]
},


    about: {
        type: String,
        maxlength: 300
    },

    skills: {
    type: [String],
    required: true,
    validate: [
        {
            validator: function (arr) {
                return Array.isArray(arr) && arr.length >= 1;
            },
            message: "At least one skill is required"
        },
        {
            validator: function (arr) {
                return arr.length <= 10;
            },
            message: "You can add max 10 skills"
        },
        {
            validator: function (arr) {
                const normalized = arr.map(s => s.toLowerCase().trim());
                return new Set(normalized).size === arr.length;
            },
            message: "Duplicate skills are not allowed"
        },
        {
            validator: function (arr) {
                return arr.every(
                    s => typeof s === "string" && s.length >= 2 && s.length <= 20
                );
            },
            message: "Each skill must be 2to20 characters long"
        }
    ]
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
},
resetPasswordToken: {
  type: String
},
resetPasswordExpiry: {
  type: Date
},
createdAt: {
  type: Date,
  select: false
},
updatedAt: {
  type: Date,
  select: false
}



}, { timestamps: true });


/*  Hash password before save */
userSchema.pre("save", async function () {
  // agar password change nahi hua → skip
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

/*  Compare password */
userSchema.methods.verifyPassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

/*  Generate JWT */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);
