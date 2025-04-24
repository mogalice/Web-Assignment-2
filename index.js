const express = require("express");
const socket = require("socket.io");

// Setup Express server
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000
const app = express();
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

// Serve static files from the "public" directory
app.use(express.static("public"));

// Initialize Socket.io
const io = socket(server);

// Set to track active users
const activeUsers = new Set();

// Socket.io event handling
io.on("connection", (socket) => {
  console.log("New socket connection");

  // Handle new user joining the chat
  socket.on("new user", (username) => {
    socket.userId = username; // Store the username in socket object
    activeUsers.add(username); // Add user to activeUsers set
    io.emit("new user", [...activeUsers]); // Broadcast updated user list

    // Notify all users about the new join
    io.emit("chat message", { nick: "System", message: `${username} joined the chat` });
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId); // Remove user from activeUsers set
    io.emit("user disconnected", socket.userId); // Notify others about the disconnection
    io.emit("chat message", { nick: "System", message: `${socket.userId} left the chat` }); // Notify about the user leaving
  });

  // Handle receiving and broadcasting chat messages
  socket.on("chat message", (data) => {
    io.emit("chat message", data); // Broadcast chat message to all users
  });

  // Handle typing event - broadcast to everyone including the sender
  socket.on("typing", (userName) => {
    io.emit("typing", userName);  // Notify all users that a user is typing
  });

  // Handle stop typing event - broadcast to everyone including the sender
  socket.on("stop typing", (userName) => {
    io.emit("stop typing", userName);  // Notify all users that a user stopped typing
  });
});