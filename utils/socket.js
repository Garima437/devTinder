const { Server } = require("socket.io");
const Message = require("../src/models/message");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    path: "/socket.io/"
  });

  io.on("connection", (socket) => {
    console.log("⚡ User connected: " + socket.id);

    socket.on("joinChat", ({ connectionId }) => {
      if (!connectionId) return;
      socket.join(connectionId);
      console.log(`👥 User joined room: ${connectionId}`);
    });

    socket.on("sendMessage", async ({ connectionId, senderId, text }) => {
      try {
        const message = new Message({
          senderId,
          connectionId,
          text,
        });
        const savedMessage = await message.save();
        io.to(connectionId).emit("messageReceived", savedMessage);
      } catch (err) {
        console.error("❌ Error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected");
    });
  });
};

module.exports = initializeSocket;