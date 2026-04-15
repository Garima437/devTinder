// const validator = require("validator");

// /* ========= SIGNUP VALIDATION ========= */
// const validateSignUpData = (req) => {
//     const { firstName, lastName, emailId, password, gender, skills,age } = req.body;

//     // Name
//     if (!firstName || !lastName) {
//         throw new Error("First name and last name are required");
//     }

//     // Email
//     if (!emailId || !validator.isEmail(emailId)) {
//         throw new Error("Email is not valid");
//     }

//     // Password
//     if (!password || !validator.isStrongPassword(password)) {
//         throw new Error(
//             "Password must be strong (min 8 chars, upper, lower, number & symbol)"
//         );
//     }
//     // Age


//     if (age && (age < 18 || age > 100)) {
//         throw new Error("Age must be between 18 and 100");
//     }

//     // Gender
//     if (!gender || !["male", "female", "other"].includes(gender.toLowerCase())) {
//         throw new Error("Gender must be male, female, or other");
//     }

//     // Skills
//     if (!Array.isArray(skills) || skills.length < 1) {
//         throw new Error("At least one skill is required");
//     }

//     if (skills.length > 10) {
//         throw new Error("You can add max 10 skills");
//     }

//     const normalizedSkills = skills.map(s => s.toLowerCase().trim());
//     if (new Set(normalizedSkills).size !== skills.length) {
//         throw new Error("Duplicate skills are not allowed");
//     }

//     for (let skill of skills) {
//         if (
//             typeof skill !== "string" ||
//             skill.length < 2 ||
//             skill.length > 20
//         ) {
//             throw new Error("Each skill must be 2 to 20 characters long");
//         }
//     }
// };

// /* ========= UPDATE VALIDATION (PATCH) ========= */
// const validateUpdateData = (req) => {
//     const allowedUpdates = ["firstName", "lastName", "gender", "skills","about"];
//     const updates = Object.keys(req.body);

//     const isValidOperation = updates.every((key) =>
//         allowedUpdates.includes(key)
//     );

//     if (!isValidOperation) {
//         throw new Error("Invalid updates");
//     }
// };
// /* ========= EDIT PROFILE VALIDATION (PATCH) ========= */
// const validateEditProfileData = (req) => {
//   const allowedUpdates = [
//     "firstName",
//     "lastName",
//     "gender",
//     "skills",
//     "about",
//     "photo",
//     "photos",
//     "age",
//   ];

//   const updates = Object.keys(req.body);

//   //  email & password cannot be edited
//   if (updates.includes("emailId") || updates.includes("password")) {
//     throw new Error("Email or password cannot be edited ");
//   }

//   const isValidOperation = updates.every((key) =>
//     allowedUpdates.includes(key)
//   );

//   if (!isValidOperation) {
//     throw new Error("Invalid profile update fields ");
//   }
// };

// module.exports = {
//     validateSignUpData,
//     validateUpdateData,
//     validateEditProfileData
// };



const validator = require("validator");

/* ========= SIGNUP VALIDATION ========= */
const validateSignUpData = (req) => {
    // 🛠️ Added photoUrl, about, and photos to the destructuring
    const { firstName, lastName, emailId, password, gender, skills, age, photoUrl, about } = req.body;

    // Name
    if (!firstName || !lastName) {
        throw new Error("First name and last name are required");
    }

    // Email
    if (!emailId || !validator.isEmail(emailId)) {
        throw new Error("Email is not valid");
    }

    // Password
    if (!password || !validator.isStrongPassword(password)) {
        throw new Error(
            "Password must be strong (min 8 chars, upper, lower, number & symbol)"
        );
    }

    // Age
    if (age && (age < 18 || age > 60)) {
        throw new Error("Age must be between 18 and 60");
    }

    // 🛠️ Optional: Photo URL Validation
    if (photoUrl && !validator.isURL(photoUrl)) {
        throw new Error("Photo URL is not valid");
    }

    // Gender
    if (!gender || !["male", "female", "other"].includes(gender.toLowerCase())) {
        throw new Error("Gender must be male, female, or other");
    }

    // Skills
    if (!Array.isArray(skills) || skills.length < 1) {
        throw new Error("At least one skill is required");
    }

    if (skills.length > 10) {
        throw new Error("You can add max 10 skills");
    }

    const normalizedSkills = skills.map(s => s.toLowerCase().trim());
    if (new Set(normalizedSkills).size !== skills.length) {
        throw new Error("Duplicate skills are not allowed");
    }

    for (let skill of skills) {
        if (
            typeof skill !== "string" ||
            skill.length < 2 ||
            skill.length > 20
        ) {
            throw new Error("Each skill must be 2 to 20 characters long");
        }
    }
};

/* ========= EDIT PROFILE VALIDATION (PATCH) ========= */
const validateEditProfileData = (req) => {
  const allowedUpdates = [
    "firstName", "lastName", "gender", "skills", "about", "photoUrl", "photos", "age",
  ];

  const updates = Object.keys(req.body);

  // 1. Explicitly Block Sensitive Fields
  if (updates.includes("emailId") || updates.includes("password")) {
    throw new Error("Email or password cannot be edited via profile update");
  }

  // 2. Filter out internal MongoDB/Mongoose fields if they sneak in
  const filteredUpdates = updates.filter(key => !["_id", "createdAt", "updatedAt", "__v"].includes(key));

  // 3. Check if the remaining fields are allowed
  const isValidOperation = filteredUpdates.every((key) =>
    allowedUpdates.includes(key)
  );

  if (!isValidOperation) {
    throw new Error("Invalid profile update fields");
  }

  // 4. Validate Specific Field formats if present
  if (req.body.photoUrl && !validator.isURL(req.body.photoUrl)) {
    throw new Error("Invalid Photo URL");
  }

  if (req.body.age && (req.body.age < 18 || req.body.age > 60)) {
    throw new Error("Age must be between 18 and 60");
  }
};

module.exports = {
    validateSignUpData,
    validateEditProfileData
};