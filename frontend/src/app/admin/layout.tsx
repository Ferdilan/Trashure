'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LayoutDashboard, Users, AlertTriangle, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (data.status !== 'success' || data.data.role !== 'ADMIN') {
        router.push('/dashboard'); // Kick non-admins back to regular dashboard
        return;
      }
    } catch (e) {
      console.error(e);
      router.push('/');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Verifikasi User', href: '/admin/users', icon: Users },
    { name: 'Sengketa', href: '/admin/disputes', icon: AlertTriangle },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-50 border-r border-slate-800 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <ShieldCheck className="h-6 w-6 text-emerald-500 mr-2" />
          <span className="font-bold text-lg tracking-tight text-white">Admin Panel</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition">
            <LogOut className="h-4 w-4" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-4 md:hidden justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Keluar</Button>
        </header>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
