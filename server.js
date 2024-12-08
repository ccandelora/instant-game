const express = require('express');
    const http = require('http');
    const socketIo = require('socket.io');
    const routes = require('./routes');
    const authenticateToken = require('./middleware/auth');

    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server);

    // Middleware
    app.use(express.json());
    app.use('/api', authenticateToken);  // Protect all routes under /api

    // Routes
    app.use('/', routes);

    // Socket.IO
    io.on('connection', (socket) => {
      console.log('New user connected');

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    server.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
