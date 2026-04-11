// const { Server } = require("socket.io");
// const Message = require("../src/models/message");

// const initializeSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log("⚡ User connected: " + socket.id);

//     // Join chat room based on user IDs to ensure both users are in the same room
//     socket.on("joinChat", ({ senderId, receiverId }) => {
//       const room = [senderId, receiverId].sort().join('-');
//       socket.join(room);
//       console.log(`👥 User joined room: ${room}`);
//     });

//     // Handle sending and saving messages
//     socket.on("sendMessage", async ({ connectionId, senderId, receiverId, text }) => {
//       console.log("📩 Received sendMessage event...");
//       console.log("Data:", { connectionId, senderId, receiverId, text });

//       try {
//         // Save to MongoDB
//         const message = new Message({
//           senderId,
//           receiverId,
//           connectionId,
//           text,
//         });

//         const savedMessage = await message.save();
//         console.log("✅ Message saved to MongoDB:", savedMessage._id);

//         // Broadcast to the room
//         const room = [senderId, receiverId].sort().join('-');
//         io.to(room).emit("messageReceived", savedMessage);
//         console.log("📣 Message broadcasted to room:", room);

//       } catch (err) {
//         console.error("❌ Error saving message:", err.message);
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ User disconnected");
//     });
//   });
// };

// module.exports = initializeSocket;


const { Server } = require("socket.io");
const Message = require("../src/models/message");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
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