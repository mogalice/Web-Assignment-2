const express = require("express");
const socket = require("socket.io");

// Setup
const PORT = process.env.PORT || 3000;
const app = express();
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on port ${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket.io setup
const io = socket(server);

const activeUsers = new Set();

io.on("connection", (socket) => {
  console.log("New socket connection");

  socket.on("new user", (username) => {
    socket.userId = username;
    activeUsers.add(username);
    io.emit("new user", [...activeUsers]);

    io.emit("chat message", { nick: "System", message: `${username} joined the chat` });
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
    io.emit("chat message", { nick: "System", message: `${socket.userId} left the chat` });
  });

  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

socket.on("typing", (name) => {
  console.log(`${name} is typing (received by server)`);
  socket.broadcast.emit("typing", name);
});

socket.on("stop typing", (name) => {
  console.log(`${name} stopped typing (received by server)`);
  socket.broadcast.emit("stop typing", name);
});

  // handle user disconnect
});