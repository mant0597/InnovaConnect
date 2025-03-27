const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST"],
  },
});

const chatRooms = {}; // Store active chat rooms

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Investor initiates chat
  socket.on("startChat", ({ investorId, startupId }) => {
    const chatId = `${investorId}_${startupId}`; // Unique chat ID
    socket.join(chatId); // Investor joins chat room
    chatRooms[chatId] = { investorId, startupId };
    console.log(`Chat started: ${chatId}`);

    // Notify startup with a "Join Chat" request
    io.emit("chatRequest", { chatId, investorId, startupId });
  });

  // Startup joins the chat
  socket.on("joinChat", ({ chatId }) => {
    socket.join(chatId);
    console.log(`Startup joined chat: ${chatId}`);

    // Notify both users that chat is active
    io.to(chatId).emit("chatActive", { chatId });
  });

  // Handle real-time messaging
  socket.on("sendMessage", ({ chatId, sender, message }) => {
    if (!chatId) {
      console.error("Error: No chat ID received for message.");
      return;
    }

    console.log(`Received message in server: ${message} from ${sender} in chat ${chatId}`);
    
    // Debugging: Check which users are in the chat room
    const usersInRoom = io.sockets.adapter.rooms.get(chatId) || new Set();
    console.log(`Users in ${chatId}:`, usersInRoom);

    // Emit the message to everyone in the chat room (Investor & Startup)
    io.to(chatId).emit("receiveMessage", { sender, message });
});

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log("Chat server running on port 3000");
});
