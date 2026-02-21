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
      enum: ["interested", "accepted", "rejected", "ignored"],
    },
  },
  {timestamps:true}
);



// 🔒 SAME USER → SAME USER → ONLY ONE REQUEST
connectionRequestSchema.index(
  { fromUserId: 1, toUserId: 1 },
  { unique: true }
);

const ConnectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);
module.exports = ConnectionRequestModel;