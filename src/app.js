require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const connectDB = require("./config/database");
const { startScheduler } = require("./utils/scheduler");
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
const paymentRouter = require("./routes/payment");
app.use("/api", paymentRouter);
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
    startScheduler();
    server.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DATABASE CONNECTION ERROR:", err);
    process.exit(1);
  });
