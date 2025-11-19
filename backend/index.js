// backend/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow your frontend URL
        methods: ["GET", "POST"]
    }
});

// Store rooms and connected users in memory (or in MongoDB)
let rooms = {}; // { roomId: { members: [socketId1, socketId2] } }

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('joinRoom', ({ roomId, email }) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = { members: [] };
        rooms[roomId].members.push(socket.id);

        console.log(`${email} joined room ${roomId}`);
    });

    // Send message to room
    socket.on('sendMessage', ({ roomId, message, sender }) => {
        io.to(roomId).emit('receiveMessage', { message, sender });
    });

    // Ring all members in a room
    socket.on('ringRoom', ({ roomId }) => {
        io.to(roomId).emit('receiveRing');
    });

    socket.on('disconnect', () => {
        // Remove user from rooms
        for (let roomId in rooms) {
            rooms[roomId].members = rooms[roomId].members.filter(id => id !== socket.id);
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
