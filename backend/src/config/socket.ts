import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import prisma from './database';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'https://trashure-theta.vercel.app', // Di production, ganti dengan origin spesifik
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.id}`);

    // User join room berdasarkan ID Supabase mereka
    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    // User join room berdasarkan ID Transaksi agar chat spesifik per transaksi
    socket.on('join_transaction_room', (transactionId: string) => {
      socket.join(`transaction_${transactionId}`);
      console.log(`Socket ${socket.id} joined room transaction_${transactionId}`);
    });

    // Saat user mengirim pesan
    socket.on('send_message', async (data: any) => {
      try {
        const { transactionId, senderId, content } = data;

        // Cari receiver otomatis dari transaksi
        const transaction = await prisma.transaction.findUnique({
          where: { id: transactionId },
          include: { listing: true }
        });

        if (!transaction) return;

        const receiverId = transaction.pengepulId === senderId
          ? transaction.listing.userId
          : transaction.pengepulId;

        // 1. Simpan pesan ke database
        const savedMessage = await prisma.message.create({
          data: {
            transactionId,
            senderId,
            receiverId,
            content
          },
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } }
          }
        });

        // 2. Broadcast pesan ke semua user yang ada di room transaksi tersebut
        io.to(`transaction_${transactionId}`).emit('receive_message', savedMessage);
        
        // Opsional: Kirim notifikasi juga ke room user penerima (dashboard alert)
        io.to(receiverId).emit('notification', {
          title: `Pesan baru dari ${savedMessage.sender.name}`,
          body: content,
          type: 'NEW_MESSAGE',
          transactionId
        });

      } catch (error) {
        console.error('Socket error - send_message:', error);
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
