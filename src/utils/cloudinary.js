

// const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// module.exports = cloudinary;


const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Temporary check for AWS debugging
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("❌ Cloudinary Config Error: Environment variables are missing!");
} else {
    console.log("✅ Cloudinary Configured: " + process.env.CLOUDINARY_CLOUD_NAME);
}

module.exports = cloudinary;