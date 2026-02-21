const express=require("express");
const requestRouter =express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");




console.log("Request router loaded");

// sent  a request

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    if (!["interested", "ignored"].includes(status)) {
      return res.status(400).send("Invalid action");
    }

    if (fromUserId.equals(toUserId)) {
      return res.status(400).send("Cannot send request to yourself");
    }

    // check both directions
    const existing = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    });

    if (existing) {
      if (existing.status === "accepted") {
        return res.status(400).send("Already matched");
      }
      return res.status(400).send("Request already exists");
    }

    // reverse interested → match
    if (status === "interested") {
      const reverse = await ConnectionRequest.findOne({
        fromUserId: toUserId,
        toUserId: fromUserId,
        status: "interested"
      });

      if (reverse) {
        reverse.status = "accepted";
        await reverse.save();

        return res.json({
          message: "🎉 It's a Match!"
        });
      }
    }

    await ConnectionRequest.create({
      fromUserId,
      toUserId,
      status
    });

    res.json({
      message: status === "interested"
        ? "Request sent"
        : "User ignored"
    });

  } catch (err) {
    res.status(500).send("Server error");
  }
});

// response to request
requestRouter.post(
  "/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid action" });
      }

      const updatedRequest = await ConnectionRequest.findOneAndUpdate(
        {
          _id: requestId,
          toUserId: req.user._id,
          status: "interested",
        },
        { status },
        { new: true }
      );

      if (!updatedRequest) {
        return res.status(404).json({
          message: "Request not found or already handled",
        });
      }

      return res.status(200).json({
        message:
          status === "accepted"
            ? "🎉 Match successful"
            : "Request rejected",
        requestId: updatedRequest._id,
        status: updatedRequest.status,
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }
);



module.exports = requestRouter;
