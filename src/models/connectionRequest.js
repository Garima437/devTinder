const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["interested", "accepted", "rejected", "ignored"],
        message: `{VALUE} is not a valid status` // Better error reporting
      },
    },
  },
  { timestamps: true }
);

// Prevent redundant requests (Compound Index)
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Prevent A -> B and B -> A appearing as two "interested" requests
// (Optional logic: handle this in the service layer for a cleaner UI)

const ConnectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequestModel;