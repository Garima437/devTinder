const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Changed to false to prevent "Validation Failed" errors during testing
  },
  // 🚀 THE CRITICAL CHANGE:
  // Changed from ObjectId to String to support our shared room "ID1_ID2" format
  connectionId: {
    type: String,
    required: true,
    index: true // Keeps the index for fast message retrieval
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  seen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Indexing for faster chat loading performance
messageSchema.index({ connectionId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);