import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import prisma from './config/database';

import { initSocket } from './config/socket';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Inisialisasi Socket.io secara terpusat agar bisa digunakan oleh controller
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
