


const { Server } = require("socket.io");
const Message = require("./models/Message"); // Ensure this is imported

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      // Replace with your AWS IP or use an array to support both local and prod
      origin: ["http://localhost:5173", "http://13.60.253.32"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected: " + socket.id);

    // Join a room unique to this match
    socket.on("joinChat", ({ firstName, userId, connectionId }) => {
      socket.join(connectionId);
      console.log(`${firstName} joined room: ${connectionId}`);
    });

    // Send message
    socket.on("sendMessage", async ({ connectionId, senderId, receiverId, text }) => {
      try {
        // 1. Save to Database
        const message = await Message.create({
            senderId,
            receiverId,
            connectionId,
            text
        });

        // 2. Emit to the room
        // Using io.to() ensures everyone in the room (sender + receiver) gets it
        io.to(connectionId).emit("messageReceived", message);

      } catch (err) {
        console.error("Error saving message:", err);
        // Optionally: emit an error back to the sender
        socket.emit("error", { msg: "Message could not be sent." });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initializeSocket;