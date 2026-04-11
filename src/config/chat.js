const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

io.on("connection", (socket) => {

  // Join a room unique to this match
  socket.on("joinRoom", ({ connectionId }) => {
    socket.join(connectionId);
  });

  // Send message
  socket.on("sendMessage", async ({ connectionId, senderId, receiverId, text }) => {
    const message = await Message.create({ senderId, receiverId, connectionId, text });
    io.to(connectionId).emit("receiveMessage", message); // both users get it
  });

  socket.on("disconnect", () => {});
});