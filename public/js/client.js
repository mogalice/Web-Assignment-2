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
  const html = user === userName
    ? `<div class="outgoing__message"><p>${message}</p><small>${time}</small></div>`
    : `<div class="incoming__message"><p><strong>${user}</strong>: ${message}</p><small>${time}</small></div>`;
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

socket.on("typing", (name) => {
  if (name !== userName) {
    document.getElementById("typing-indicator").textContent = `${name} is typing...`;
  }
});

socket.on("stop typing", (name) => {
  if (name !== userName) {
    document.getElementById("typing-indicator").textContent = "";
  }
});

socket.on("chat message", (data) => {
  addNewMessage({ user: data.nick, message: data.message });
});

socket.on("typing", (name) => {
  console.log(`${name} is typing`);
  if (name !== userName) {
    document.getElementById("typing-indicator").textContent = `${name} is typing...`;
  }
});

socket.on("stop typing", (name) => {
  console.log(`${name} stopped typing`);
  if (name !== userName) {
    document.getElementById("typing-indicator").textContent = "";
  }
});