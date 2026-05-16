'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Leaf, LayoutDashboard, List, Package, Wallet, User as UserIcon, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { io, Socket } from 'socket.io-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  interface UserProfile {
    id: string;
    name: string;
    role: string;
  }

  interface NotificationData {
    title: string;
    body: string;
  }

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      // Ambil profile dari backend
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUserProfile(data.data);

        // Initialize Socket.io after user profile is loaded
        const newSocket = io('http://localhost:5000');
        newSocket.on('connect', () => {
          // Join room with user ID
          newSocket.emit('join', data.data.id);
        });

        newSocket.on('notification', (msg: NotificationData) => {
          setNotifications(prev => [msg, ...prev]);
          // You could also trigger a Toast here
        });

        setSocket(newSocket);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (socket) socket.disconnect();
    };
  }, [socket]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const role = userProfile?.role || 'PEMILIK';
  
  const navItems = role === 'PEMILIK' ? [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Listing Saya', href: '/dashboard/listings', icon: List },
    { name: 'Transaksi', href: '/dashboard/transactions', icon: Package },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Profil', href: '/dashboard/profile', icon: UserIcon },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cari Sampah', href: '/dashboard/feed', icon: List },
    { name: 'Tugas Pickup', href: '/dashboard/pickup', icon: Package },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Profil', href: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="bg-primary/10 p-2 rounded-lg mr-2">
            <Leaf className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-primary">Trashure</span>
        </div>
        
        <div className="p-4 border-b">
          <div className="font-medium truncate">{userProfile?.name}</div>
          <div className="text-xs text-muted-foreground uppercase mt-1 bg-muted inline-block px-2 py-0.5 rounded">
            {role}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-card border-b flex items-center px-4 justify-between md:justify-end">
          <div className="flex items-center gap-2 md:hidden">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Trashure</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer hover:bg-muted p-2 rounded-full transition">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-2 h-2.5 w-2.5 bg-destructive rounded-full border-2 border-card"></span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="md:hidden">Keluar</Button>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 relative">
          {/* Notification Toasts (Simple Implementation) */}
          {notifications.length > 0 && (
            <div className="absolute top-4 right-8 z-50 flex flex-col gap-2 max-w-sm w-full">
              {notifications.slice(0, 3).map((notif, i) => (
                <div key={i} className="bg-card border-l-4 border-l-primary shadow-lg p-4 rounded-lg flex justify-between items-start animate-in slide-in-from-right-8 fade-in">
                  <div>
                    <h4 className="font-bold text-sm">{notif.title}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{notif.body}</p>
                  </div>
                  <button onClick={() => setNotifications(prev => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-foreground text-xs">
                    Tutup
                  </button>
                </div>
              ))}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}
