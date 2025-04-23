const socket = io();

const inboxPeople = document.querySelector(".inbox__people");

let userName = `user-${Math.floor(Math.random() * 1000000)}`;
socket.emit("new user", userName);
addToUsersBox(userName);

function addToUsersBox(name) {
  if (!!document.querySelector(`.${name}-userlist`)) return;
  inboxPeople.innerHTML += `<div class="chat_id ${name}-userlist"><h5>${name}</h5></div>`;
}

socket.on("new user", (users) => {
  users.forEach((user) => addToUsersBox(user));
});

socket.on("user disconnected", (name) => {
  const el = document.querySelector(`.${name}-userlist`);
  if (el) el.remove();
});

const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

function addNewMessage({ user, message }) {
  const time = new Date().toLocaleTimeString();
  let html = "";

  if (user === "System") {
    html = `<div class="system__message"><em>${message}</em></div>`;
  } else if (user === userName) {
    html = `<div class="outgoing__message"><p>${message}</p><small>${time}</small></div>`;
  } else {
    html = `<div class="incoming__message"><p><strong>${user}</strong>: ${message}</p><small>${time}</small></div>`;
  }

  messageBox.innerHTML += html;
}

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) return;
  socket.emit("chat message", { message: inputField.value, nick: userName });
  inputField.value = "";
});

let typing = false;
let typingTimeout;

inputField.addEventListener("input", () => {
  if (!typing) {
    typing = true;
    socket.emit("typing", userName);
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typing = false;
    socket.emit("stop typing", userName);
  }, 1000);
});


socket.on("chat message", (data) => {
  addNewMessage({ user: data.nick, message: data.message });
});

const typingMessages = new Map();

socket.on("typing", (name) => {
  if (name !== userName && !typingMessages.has(name)) {
    const id = `typing-${name}`;
    const messageElement = document.createElement("div");
    messageElement.className = "typing__message";
    messageElement.id = id;
    messageElement.innerHTML = `<em>${name} is typing...</em>`;
    messageBox.appendChild(messageElement);
    typingMessages.set(name, messageElement);
  }
});

socket.on("stop typing", (name) => {
  const id = `typing-${name}`;
  const element = document.getElementById(id);
  if (element) {
    element.remove();
    typingMessages.delete(name);
  }
});



