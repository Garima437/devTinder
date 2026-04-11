


const { Server } = require("socket.io");
const Message = require("../src/models/message");

const initializeSocket = (server) => {
  // const io = new Server(server, {
  //   cors: {
  //     origin: "http://localhost:5173",
  //     methods: ["GET", "POST"],
  //     credentials: true,
  //   },
  // });
  const io = new Server(server, {
  cors: {
    // Add your AWS IP here
    origin: ["http://localhost:5173", "http://13.60.253.32"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

  io.on("connection", (socket) => {
    console.log("⚡ User connected: " + socket.id);

    // 1. Join chat room using the CONNECTION ID from frontend
    socket.on("joinChat", ({ connectionId }) => {
      if (!connectionId) return;

      socket.join(connectionId); // Use the string directly!
      console.log(`👥 User joined room: ${connectionId}`);
    });

    // 2. Handle sending and saving messages
    socket.on("sendMessage", async ({ connectionId, senderId, text }) => {
      console.log("📩 Received sendMessage event...");

      try {
        // Save to MongoDB
        const message = new Message({
          senderId,
          connectionId, // This is your "ID1_ID2" string
          text,
        });

        const savedMessage = await message.save();
        console.log("✅ Message saved to MongoDB:", savedMessage._id);

        // 🚀 THE BIG FIX: Broadcast to the EXACT same connectionId
        // This ensures the receiver (who joined this room) gets it instantly.
        io.to(connectionId).emit("messageReceived", savedMessage);

        console.log("📣 Message broadcasted to room:", connectionId);

      } catch (err) {
        console.error("❌ Error saving message:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });
};

module.exports = initializeSocket;