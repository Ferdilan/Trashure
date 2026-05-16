import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from './database';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Untuk dev, nanti disesuaikan dengan domain frontend
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    // User bisa join room berdasarkan ID Supabase mereka
    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    // Handle Chat Internal (Phase 4.2)
    socket.on('send_message', async (data: { transactionId: string, senderId: string, receiverId: string, content: string }) => {
      try {
        const { transactionId, senderId, receiverId, content } = data;
        
        // Simpan ke DB
        const message = await prisma.message.create({
          data: {
            transactionId,
            senderId,
            receiverId,
            content
          },
          include: {
            sender: { select: { name: true, role: true } }
          }
        });

        // Broadcast ke pengirim dan penerima
        io.to(receiverId).emit('receive_message', message);
        io.to(senderId).emit('receive_message', message);
        
        // Opsional: Kirim notifikasi juga ke penerima
        io.to(receiverId).emit('notification', {
          title: `Pesan baru dari ${message.sender.name}`,
          body: content,
          type: 'NEW_MESSAGE',
          transactionId
        });

      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
