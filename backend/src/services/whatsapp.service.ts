// src/services/whatsapp.service.ts
// CATATAN: Untuk menggunakan ini, Anda perlu menginstal: 
// npm install whatsapp-web.js qrcode-terminal

import { Client, LocalAuth } from 'whatsapp-web.js';
// @ts-ignore
import qrcode from 'qrcode-terminal';

let isReady = false;

export const waClient = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

waClient.on('qr', (qr) => {
  console.log('\n=========================================');
  console.log('SCAN QR CODE INI DI WHATSAPP ANDA');
  console.log('=========================================');
  qrcode.generate(qr, { small: true });
});

waClient.on('ready', () => {
  console.log('WhatsApp Bot is READY!');
  isReady = true;
});

waClient.on('disconnected', () => {
  console.log('WhatsApp Bot was DISCONNECTED!');
  isReady = false;
});

// Initialize client
// waClient.initialize();

// MOCK FUNCTION (Ganti isMock = false jika sudah install whatsapp-web.js)
const isMock = false;

export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  if (!phoneNumber) return;

  // Format phone number to WhatsApp format (0812... -> 62812...)
  let formattedNumber = phoneNumber.replace(/\D/g, '');
  if (formattedNumber.startsWith('0')) {
    formattedNumber = '62' + formattedNumber.substring(1);
  }

  const chatId = `${formattedNumber}@c.us`;

  if (isMock) {
    console.log(`\n[MOCK WA NOTIFICATION] To: ${formattedNumber}`);
    console.log(`Message: \n${message}\n`);
    return;
  }

  if (!isReady) {
    console.log('WA Client not ready, skipping message to', formattedNumber);
    return;
  }

  try {
    await waClient.sendMessage(chatId, message);
    console.log(`WhatsApp message sent to ${formattedNumber}`);
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${formattedNumber}:`, error);
  }
};
