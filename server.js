require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

// Socket.io setup with better error handling
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('message', async (userMessage, callback) => {
    try {
      const botReply = await generateBotResponse(userMessage);
      socket.emit('message', { status: 'success', reply: botReply });
      if (callback) callback({ status: 'received' });
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('message', { status: 'error', message: 'Failed to process message' });
      if (callback) callback({ status: 'error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});