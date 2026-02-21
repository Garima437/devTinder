require("dotenv").config();

const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const { userAuth } = require("./middlewares/auth");
const app = express();
const port = 3000;
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter=require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/request",requestRouter);
app.use("/user",userRouter);

/* ================= DB + SERVER ================= */
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("Server running on port " + port);
    });
  })
  .catch(() => {
    console.log("Database connection failed");
  });
console.log("MONGO URI =>", process.env.MONGODB_URI);
