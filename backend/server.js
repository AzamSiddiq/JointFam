// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import pushRoutes from "./routes/push.js";
import User from "./models/User.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/push", pushRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// HTTP server required by socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// rooms map: roomId => [{ id: socket.id, email, name }]
const rooms = {};

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // When client disconnects remove from any room lists
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (const roomId of Object.keys(rooms)) {
      const before = rooms[roomId].length;
      rooms[roomId] = rooms[roomId].filter(m => m.id !== socket.id);
      if (rooms[roomId].length !== before) {
        // emit updated member list (array of {email, name})
        io.to(roomId).emit("room-members", rooms[roomId].map(m => ({ email: m.email, name: m.name })));
      }
      // if empty, optionally delete room: if (rooms[roomId].length === 0) delete rooms[roomId];
    }
  });

  // Join room: accept email + name
  socket.on("join-room", ({ roomId, email, name }) => {
    if (!roomId || !email) return;

    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];

    // remove existing entry for same email (avoid duplicates) and then add/update
    const existingIndex = rooms[roomId].findIndex(m => m.email === email);
    if (existingIndex >= 0) {
      rooms[roomId][existingIndex].id = socket.id;
      rooms[roomId][existingIndex].name = name || rooms[roomId][existingIndex].name;
    } else {
      rooms[roomId].push({ id: socket.id, email, name });
    }

    // emit updated member objects
    io.to(roomId).emit("room-members", rooms[roomId].map(m => ({ email: m.email, name: m.name })));
    // Optionally: send room history if persisted
    // socket.emit("room-history", ... );
  });

  // Ring all
  socket.on("ring-all", ({ roomId, from }) => {
    io.to(roomId).emit("ring", from);
  });

  // Ring a specific user (email)
  socket.on("ring-user", ({ to, from }) => {
    if (!to) return;
    // find target socket id in all rooms
    for (const roomId of Object.keys(rooms)) {
      const target = rooms[roomId].find(m => m.email === to);
      if (target) {
        io.to(target.id).emit("ring", from);
        break;
      }
    }
  });

  // Room message (broadcast)
  socket.on("room-message", (msg) => {
    if (!msg?.roomId) return;
    io.to(msg.roomId).emit("room-new-message", msg);
  });

  // Private message: deliver only to target and echo back to sender
  socket.on("send-message", ({ to, from, message }) => {
    if (!to || !from) return;
    // find target socket id
    let targetId = null;
    for (const roomId of Object.keys(rooms)) {
      const target = rooms[roomId].find(m => m.email === to);
      if (target) { targetId = target.id; break; }
    }

    // emit to receiver
    if (targetId) {
      io.to(targetId).emit("receive-message", { from, to, message });
    }
    // echo back to sender
    io.to(socket.id).emit("receive-message", { from, to, message });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
