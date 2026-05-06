const { Server } = require("socket.io");
const Message = require("../models/Message");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://13.60.253.32"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    process.stdout.write("User connected: " + socket.id + "\n");

    socket.on("joinChat", (data) => {
      const { connectionId } = data;
      socket.join(connectionId);
      process.stdout.write("User joined room: " + connectionId + "\n");
    });

    socket.on("sendMessage", async (data) => {
      process.stdout.write("RAW:" + JSON.stringify(data) + "\n");
      let { connectionId, senderId, receiverId, text } = data;
      if (!receiverId && connectionId && senderId) {
        const ids = connectionId.split("_");
        receiverId = ids[0].toString() === senderId.toString() ? ids[1] : ids[0];
      }
      process.stdout.write("DERIVED receiverId:" + receiverId + "\n");
      try {
        const message = await Message.create({ senderId, receiverId, connectionId, text });
        process.stdout.write("SAVED:" + message._id + "\n");
        io.to(connectionId).emit("messageReceived", message);
      } catch (err) {
        process.stderr.write("FAILED:" + err.message + " DATA:" + JSON.stringify({ senderId, receiverId, connectionId, text }) + "\n");
        socket.emit("error", { msg: "Message could not be sent." });
      }
    });

    socket.on("disconnect", () => {
      process.stdout.write("User disconnected\n");
    });
  });
};

module.exports = initializeSocket;
