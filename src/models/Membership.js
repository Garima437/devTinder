const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  plan: {
    type: String,
    enum: ["gold", "silver"],
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  paymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created"
  },
  amount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Membership", membershipSchema);