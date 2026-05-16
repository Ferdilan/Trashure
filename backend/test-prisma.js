require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Mencoba koneksi ke database...");
  try {
    await prisma.$connect();
    console.log("✅ Berhasil terkoneksi ke Neon Database (PostgreSQL) via Prisma!");
    
    // Query sederhana untuk mengecek respons database
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("Waktu database saat ini:", result[0].now);
  } catch (error) {
    console.error("❌ Gagal terkoneksi ke Database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
