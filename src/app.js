
// require("dotenv").config();

// console.log("🟢 Starting app initialization...");

// console.log("  → Loading express...");
// const express = require("express");
// console.log("  ✅ express loaded");

// console.log("  → Loading cors...");
// const cors = require("cors");
// console.log("  ✅ cors loaded");

// console.log("  → Loading cookie-parser...");
// const cookieParser = require("cookie-parser");
// console.log("  ✅ cookie-parser loaded");

// console.log("  → Loading database config...");
// const connectDB = require("./config/database");
// console.log("  ✅ database config loaded");

// const app = express();
// const port = process.env.PORT || 3000;

// console.log("🟢 Base imports loaded");

// /* ================= MIDDLEWARES ================= */
// // 1. Cross-Origin Resource Sharing (Important for React/Vite)
// app.use(cors({
//   origin: "http://localhost:5173", // Replace with your frontend URL
//   credentials: true
// }));

// // 2. Body Parsers
// app.use(express.json());
// app.use(cookieParser());

// console.log("🟢 Middlewares loaded");

// /* ================= ROUTERS ================= */
// let authRouter, profileRouter, requestRouter, userRouter;

// try {
//   authRouter = require("./routes/auth");
//   console.log("🟢 Auth router loaded");
// } catch (e) {
//   console.error("❌ Error loading auth router:", e.message);
//   process.exit(1);
// }

// try {
//   profileRouter = require("./routes/profile");
//   console.log("🟢 Profile router loaded");
// } catch (e) {
//   console.error("❌ Error loading profile router:", e.message);
//   process.exit(1);
// }

// try {
//   requestRouter = require("./routes/request");
//   console.log("🟢 Request router loaded");
// } catch (e) {
//   console.error("❌ Error loading request router:", e.message);
//   process.exit(1);
// }

// try {
//   userRouter = require("./routes/user");
//   console.log("🟢 User router loaded");
// } catch (e) {
//   console.error("❌ Error loading user router:", e.message);
//   process.exit(1);
// }


// app.use("/", authRouter);
// app.use("/", profileRouter);
// app.use("/request", requestRouter);
// app.use("/user", userRouter);

// console.log("🟢 All routers registered");

// /* ================= GLOBAL ERROR HANDLER ================= */
// // This catches any errors thrown in your routes so the app doesn't crash
// app.use((err, req, res, next) => {
//   if (err) {
//     res.status(500).json({ message: err.message || "Internal Server Error" });
//   }
// });

// console.log("🟢 Error handler registered");

// /* ================= DB + SERVER START ================= */
// console.log("Attempting to connect to MongoDB..."); // This will show up if the app isn't dead

// connectDB()
//   .then(() => {
//     console.log("✅ Database connection established...");
//     app.listen(port, () => {
//       console.log(`🚀 Server running on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ DATABASE CONNECTION ERROR:");
//     console.error(err); // This prints the EXACT reason (Timeout, Auth Failed, etc.)
//     process.exit(1);
//   });


// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const http = require("http"); // 1. Import HTTP module
// const { Server } = require("socket.io"); // 2. Import Socket.io
// const connectDB = require("./config/database");
// const initializeSocket = require("../utils/socket"); // 3. Import your socket utility

// const app = express();
// const port = process.env.PORT || 3000;

// // Create the HTTP server wrapping the express app
// const server = http.createServer(app); // 4. Essential for WebSockets

// /* ================= MIDDLEWARES ================= */
// // app.use(cors({
// //   origin: "http://localhost:5173",
// //   credentials: true
// // }));
// app.use(cors({
//   origin: ["http://localhost:5173", "http://13.60.253.32","http://13.60.253.32:80"],
//   credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());

// /* ================= ROUTERS ================= */
// const authRouter = require("./routes/auth");
// const profileRouter = require("./routes/profile");
// const requestRouter = require("./routes/request");
// const userRouter = require("./routes/user");

// app.use("/", authRouter);
// app.use("/", profileRouter);
// app.use("/request", requestRouter);
// app.use("/user", userRouter);

// // app.use("/api", authRouter);
// // app.use("/", authRouter);
// // app.use("/api", profileRouter);
// // app.use("/api/request", requestRouter);
// // app.use("/api/user", userRouter);
// // 5. Initialize the Socket logic
// initializeSocket(server);

// /* ================= GLOBAL ERROR HANDLER ================= */
// app.use((err, req, res, next) => {
//   res.status(500).json({ message: err.message || "Internal Server Error" });
// });

// /* ================= DB + SERVER START ================= */
// connectDB()
//   .then(() => {
//     console.log("✅ Database connection established...");
//     // 6. IMPORTANT: Use server.listen, NOT app.listen
//     server.listen(port, () => {
//       console.log(`🚀 Server running on port ${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ DATABASE CONNECTION ERROR:", err);
//     process.exit(1);
//   });


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const connectDB = require("./config/database");
const initializeSocket = require("../utils/socket"); // Double check this path!

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

/* ================= MIDDLEWARES ================= */
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://13.60.253.32", // <-- Add this! This is your Frontend
  "http://13.60.253.32:3000"   // This is your Backend
].filter(Boolean);


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ ADDED: Serve static files from the public folder (important for Multer)
app.use("/public", express.static("public"));

/* ================= ROUTERS ================= */
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);

// Initialize Socket.io
initializeSocket(server);

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

/* ================= DB + SERVER START ================= */
connectDB()
  .then(() => {
    console.log("✅ Database connection established...");
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION ERROR:", err);
    process.exit(1);
  });