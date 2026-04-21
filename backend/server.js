const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🟢 USER JOIN
  socket.on("join", (username) => {
    users[socket.id] = username;

    console.log(username + " joined");

    // send updated users list
    io.emit("onlineUsers", Object.values(users));
  });

  // 💬 SEND MESSAGE
  socket.on("sendMessage", (data) => {
    const messageData = {
      user: data.user,
      text: data.text,
      time: new Date().toLocaleTimeString(),
    };

    io.emit("receiveMessage", messageData);
  });

  // ⌨️ TYPING
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  // 🛑 STOP TYPING
  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    const username = users[socket.id];
    console.log("User disconnected:", username);

    delete users[socket.id];

    // update users list
    io.emit("onlineUsers", Object.values(users));
  });
});

// SERVER START
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});