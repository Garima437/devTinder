
// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("MongoDB connected successfully ");
//   } catch (err) {
//     console.error("MongoDB connection failed ");
//     console.error(err.message);
//     throw err;
//   }
// };

// module.exports = connectDB;
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Check if the URI is actually being loaded
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not defined in environment variables!");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully to Cloud Instance");
  } catch (err) {
    console.error("MongoDB connection failed! Check your AWS IP Whitelist.");
    console.error(err.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectDB;