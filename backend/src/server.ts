import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import prisma from './config/database';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Inisialisasi Socket.io
const io = new Server(server, {
  cors: {
    origin: 'https://trashure-theta.vercel.app', // Di production, ganti dengan origin spesifik
    methods: ['GET', 'POST']
  }
});

// Middleware untuk memverifikasi socket connection jika perlu (bisa dengan kirim token)
// Saat ini kita ambil userId dari data emit saja untuk kesederhanaan MVP

io.on('connection', (socket) => {
  console.log('User connected via Socket.io:', socket.id);

  // User join room berdasarkan ID Transaksi agar chat spesifik per transaksi
  socket.on('join_transaction_room', (transactionId) => {
    socket.join(`transaction_${transactionId}`);
    console.log(`Socket ${socket.id} joined room transaction_${transactionId}`);
  });

  // Saat user mengirim pesan
  socket.on('send_message', async (data) => {
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
    } catch (error) {
      console.error('Socket error - send_message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
