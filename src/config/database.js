
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully ");
  } catch (err) {
    console.error("MongoDB connection failed ");
    console.error(err.message);
    throw err;
  }
};

module.exports = connectDB;
