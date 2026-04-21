const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // 1. Extract Token
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      // Better for debugging: Log this on the server, but keep response clean
      console.log("No token found in request");
      return res.status(401).json({ message: "Please Login!!" });
    }

    // 2. Verify Secret exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables!");
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // 3. Decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find User (using .select('-password') for security)
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 5. Attach to Request
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth Middleware Error:", err.message);

    // Handle Expired Token specifically
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token Expired. Please login again." });
    }

    return res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = { userAuth };