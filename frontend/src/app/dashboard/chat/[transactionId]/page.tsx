'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { io, Socket } from 'socket.io-client';
import { Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const { transactionId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [receiverId, setReceiverId] = useState<string>(''); // Simplified
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  const initChat = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Get profile
      const profRes = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const profData = await profRes.json();
      if (profData.status === 'success') {
        setUserProfile(profData.data);
      }

      // Initialize Socket specifically for chat
      const newSocket = io('http://localhost:5000');
      newSocket.on('connect', () => {
        newSocket.emit('join', profData.data.id);
      });

      newSocket.on('receive_message', (msg) => {
        if (msg.transactionId === transactionId) {
          setMessages(prev => [...prev, msg]);
        }
      });

      setSocket(newSocket);

      // Fetch message history
      const msgRes = await fetch(`http://localhost:5000/api/messages/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const msgData = await msgRes.json();
      if (msgData.status === 'success') {
        setMessages(msgData.data);
        
        // Find receiver ID (assuming it's either the transaction.pengepulId or transaction.listing.userId)
        // For MVP, we extract the other person from the messages history if exists
        const otherMsg = msgData.data.find((m: any) => m.senderId !== profData.data.id);
        if (otherMsg) {
          setReceiverId(otherMsg.senderId);
        } else {
          // You would typically fetch the transaction details here to know the exact receiverId
          // Hardcoded for demo if empty:
          setReceiverId('another-user-id');
        }
      }

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !userProfile) return;

    socket.emit('send_message', {
      transactionId,
      senderId: userProfile.id,
      receiverId: receiverId, // Dalam aplikasi nyata, ID penerima diambil dari detail Transaksi
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  if (!userProfile) return <div>Memuat chat...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] max-w-3xl mx-auto bg-card rounded-2xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/50 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-full">
          <UserIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">Diskusi Transaksi</h2>
          <p className="text-xs text-muted-foreground">ID: {transactionId}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Belum ada pesan. Mulai diskusi sekarang.
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === userProfile.id;
            return (
              <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 mx-1">
                  {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-3 border-t bg-card flex items-center gap-2">
        <input
          type="text"
          placeholder="Ketik pesan..."
          className="flex-1 h-11 px-4 rounded-full border bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition text-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="submit" size="icon" className="h-11 w-11 rounded-full shrink-0" disabled={!newMessage.trim()}>
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
