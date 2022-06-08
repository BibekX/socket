const chatForm = document.querySelector("#chat-form");
const chatMessage = document.querySelector(".chat-messages");
const roomName = document.querySelector("#room-name");
const userList = document.querySelector("#users");

//Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//Join chatroom
socket.emit("joinRoom", { username, room });

//Get room and users
socket.on("roomUser", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  outputMessage(message);

  //Scroll down
  chatMessage.scrollTop = chatMessage.scrollHeight;
});

//Message Submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //Get message from the input
  const msg = e.target.msg.value;

  //Emit message to server
  socket.emit("chatMessage", msg);

  e.target.msg.value = "";
});

//Output message to DOM
function outputMessage(message) {
  let div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
  <p class="text">
   ${message.text}
  </p>`;
  chatMessage.append(div);
}

//Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//Add users to DOM
function outputUsers(users) {
  let userNames = users.map((user) => `<li>${user.username}</li>`).join("");
  console.log(userNames);
  userList.innerHTML = userNames;
}
