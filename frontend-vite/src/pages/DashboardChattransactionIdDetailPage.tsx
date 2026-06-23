
import { useState, useEffect, useRef } from 'react';
import {  useParams  } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { Send, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const { transactionId } = useParams();
  interface UserProfile {
    id: string;
    name: string;
  }

  interface ChatMessage {
    id?: string;
    transactionId: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
  }

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  const fetchMessages = async (sessionToken: string) => {
    if (isFetching.current) return;
    try {
      isFetching.current = true;
      const msgRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${sessionToken}` }
      });
      const msgData = await msgRes.json();
      if (msgData.status === 'success') {
        // Only update state if length is different to avoid unnecessary re-renders
        setMessages(prev => {
          if (prev.length !== msgData.data.length) {
             return msgData.data;
          }
          return prev;
        });
      }
    } catch (e) {
      console.error('Error fetching messages:', e);
    } finally {
      isFetching.current = false;
    }
  };

  const initChat = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      // Get profile
      const profRes = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const profData = await profRes.json();
      if (profData.status === 'success') {
        setUserProfile(profData.data);
      }

      // Initial fetch
      await fetchMessages(session.access_token);

      // Start HTTP Polling every 10 seconds
      const intervalId = setInterval(() => {
        fetchMessages(session.access_token);
      }, 10000);

      return () => clearInterval(intervalId);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let cleanupFunc: void | (() => void);
    
    initChat().then(cleanup => {
      if (typeof cleanup === 'function') {
        cleanupFunc = cleanup;
      }
    });

    return () => {
      if (cleanupFunc) cleanupFunc();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;

    const content = newMessage.trim();
    setNewMessage(''); // optimistic clear

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          transactionId,
          content
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        // Optimistically add the message or wait for the next poll
        setMessages(prev => [...prev, data.data]);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    }
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
