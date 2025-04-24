// Initialize socket connection
const socket = io();

// Select elements for UI interactions
const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

// Generate a unique username
let userName = `user-${Math.floor(Math.random() * 1000000)}`;

// Emit "new user" event with the generated username
socket.emit("new user", userName);
addToUsersBox(userName);

// Add a new user to the user list UI
function addToUsersBox(name) {
  // Check if the user already exists in the list
  if (!!document.querySelector(`.${name}-userlist`)) return;
  // Append new user to the inbox list
  inboxPeople.innerHTML += `
    <div class="chat_id ${name}-userlist">
      <h5>${name}<span class="typing-status" id="status-${name}"></span></h5>
    </div>
  `;
}

// Listen for "new user" event and update the user list
socket.on("new user", (users) => {
  users.forEach((user) => addToUsersBox(user));
});

// Listen for "user disconnected" event and remove the user from the list
socket.on("user disconnected", (name) => {
  const el = document.querySelector(`.${name}-userlist`);
  if (el) el.remove();
});

// Function to add a new message to the message box
function addNewMessage({ user, message }) {
  const time = new Date().toLocaleTimeString(); // Get current time

  let html = "";
  
  // Check for system message, outgoing message, or incoming message
  if (user === "System") {
    html = `<div class="system__message"><em>${message}</em></div>`;
  } else if (user === userName) {
    html = `<div class="outgoing__message"><p>${message}</p><small>${time}</small></div>`;
  } else {
    html = `<div class="incoming__message"><p><strong>${user}</strong>: ${message}</p><small>${time}</small></div>`;
  }

  messageBox.innerHTML += html; // Append message to the message box
}

// Handle message form submission
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) return; // Do nothing if input is empty

  // Emit "chat message" event with the message and sender's nickname
  socket.emit("chat message", { message: inputField.value, nick: userName });
  
  // Clear input field after sending
  inputField.value = "";
});

// Typing indicator logic
let typing = false;
let typingTimeout;

// Detect typing in the input field and emit typing event
inputField.addEventListener("input", () => {
  if (!typing) {
    typing = true;
    socket.emit("typing", userName); // Emit 'typing' event to everyone
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typing = false;
    socket.emit("stop typing", userName); // Emit 'stop typing' event to everyone
  }, 1000);
});

// Listen for incoming chat messages and add them to the chat
socket.on("chat message", (data) => {
  addNewMessage({ user: data.nick, message: data.message });
});

// Handle typing indicator display
socket.on("typing", (name) => {
  if (name !== userName) {  // Prevent showing your own typing status
    const statusEl = document.getElementById(`status-${name}`);
    if (statusEl) statusEl.textContent = " - typing...";  // Show typing status
  }
});

// Handle stop typing indicator
socket.on("stop typing", (name) => {
  const statusEl = document.getElementById(`status-${name}`);
  if (statusEl) statusEl.textContent = "";  // Clear typing status
});


