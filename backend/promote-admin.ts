// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const emailToPromote = process.argv[2];

  if (!emailToPromote) {
    console.error('Harap masukkan email user yang ingin dijadikan Admin.');
    console.error('Contoh: npx ts-node promote-admin.ts admin@trashure.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: emailToPromote },
      data: { role: 'ADMIN' }
    });
    console.log(`Berhasil! User ${user.name} (${user.email}) sekarang adalah ADMIN.`);
  } catch (error) {
    console.error(`Gagal mengupdate user: ${emailToPromote}`);
    console.error('Pastikan email tersebut sudah terdaftar di aplikasi.');
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
