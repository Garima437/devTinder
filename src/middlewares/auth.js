
// const User = require("../models/user");

// const userAuth = async (req, res, next) => {
//   try {
//     const token =
//       req.cookies?.token ||
//       req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       return res.status(401).send("Token missing");
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔥 lightweight user fetch
//     const user = await User.findById(decoded._id).select("_id emailId");

//     if (!user) {
//       return res.status(401).send("User not found");
//     }

//     req.user = user; // only id + email
//     next();
//   } catch (err) {
//     return res.status(401).send("Unauthorized");
//   }
// };

// module.exports = { userAuth };
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id); 

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { userAuth };
