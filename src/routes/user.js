
const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
console.log("Request router loaded");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills"
//  Get all received pending requests
userRouter.get(
  "/requests/received",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUserId = req.user._id;

      const connectionRequests = await ConnectionRequest.find({
        toUserId: loggedInUserId,
        status: "interested",
      })
        .populate(
          "fromUserId",
          "firstName lastName photo age gender about skills"
        )
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: "Requests fetched successfully",
        count: connectionRequests.length,
        data: connectionRequests,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// get connections who is accept my req

userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequests.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});


// feed in devTinder


userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 0;
    const limit = 10;

    // Step 1: Get users to exclude
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ]
    }).select("fromUserId toUserId");

    const swipes = await Swipe.find({
      fromUserId: loggedInUser._id
    }).select("toUserId");

    let excludeUserIds = new Set();

    connections.forEach((c) => {
      excludeUserIds.add(c.fromUserId.toString());
      excludeUserIds.add(c.toUserId.toString());
    });

    swipes.forEach((s) => {
      excludeUserIds.add(s.toUserId.toString());
    });

    excludeUserIds.add(loggedInUser._id.toString());

    // Step 2: Fetch feed users
    const users = await User.find({
      _id: { $nin: Array.from(excludeUserIds) },
      isActive: true
    })
      .select(USER_SAFE_DATA)
      .limit(limit)
      .skip(page * limit)
      .lean(); // important for performance

    res.status(200).json(users);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load feed" });
  }
});

module.exports = userRouter;
