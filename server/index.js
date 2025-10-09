const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..')));

// Routes
const projectRoutes = require('./routes/projects');
const aiRoutes = require('./routes/ai');
const assetRoutes = require('./routes/assets');
const samRoutes = require('./routes/sam');

app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/sam', samRoutes);

// WebSocket for real-time collaboration
const activeProjects = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    if (!activeProjects.has(projectId)) {
      activeProjects.set(projectId, new Set());
    }
    activeProjects.get(projectId).add(socket.id);
    
    // Notify others
    socket.to(projectId).emit('user-joined', {
      userId: socket.id,
      timestamp: Date.now()
    });
  });

  socket.on('project-update', (data) => {
    socket.to(data.projectId).emit('project-update', {
      ...data,
      userId: socket.id
    });
  });

  socket.on('cursor-move', (data) => {
    socket.to(data.projectId).emit('cursor-move', {
      userId: socket.id,
      ...data
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeProjects.forEach((users, projectId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(projectId).emit('user-left', {
          userId: socket.id,
          timestamp: Date.now()
        });
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AI Service URL: ${process.env.AI_SERVICE_URL || 'http://localhost:5000'}`);
});

module.exports = { app, io };
