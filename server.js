const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const port = 3000;
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static("public"));
const botName = "ChatCord Bot";

//Run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //Welcome current user
    //Emit to the user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    //Broadcast to other users when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    //Send user and room info
    io.to(user.room).emit("roomUser", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listen for chatMessage
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    //Broadcast to everyone
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });

  //Runs when a client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      //Broadcast to other users when a user connects
      // socket.broadcast.emit() works as well
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `A ${user.username} has left the chat`)
        );
      //Send user and room info
      io.to(user.room).emit("roomUser", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(port, () => console.log(`Listening to port ${port}`));
