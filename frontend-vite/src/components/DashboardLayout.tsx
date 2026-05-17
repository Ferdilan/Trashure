import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { 
  LayoutDashboard, Search, List, Receipt, Wallet, 
  User, LogOut, Menu, X, Leaf 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Memuat...');
  const [userAvatar, setUserAvatar] = useState<string>('');

  useEffect(() => {
    // Check session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        const profileRes = await fetch(`http://localhost:5000/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const profileJson = await profileRes.json();
        if (profileJson.status === 'success') {
          setUserRole(profileJson.data.role);
          setUserName(profileJson.data.name);
          setUserAvatar(profileJson.data.avatarUrl);
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cari Sampah', href: '/dashboard/feed', icon: Search, role: 'PENGEPUL' },
    { name: 'Listing Saya', href: '/dashboard/listings', icon: List, role: 'PEMILIK' },
    { name: 'Transaksi', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet, role: 'PEMILIK' },
    { name: 'Profil', href: '/dashboard/profile', icon: User },
    
    // Admin specific links
    { name: 'Admin Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, role: 'ADMIN' },
    { name: 'Kelola Pengguna', href: '/dashboard/admin/users', icon: User, role: 'ADMIN' },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (userRole === 'ADMIN') {
      return ['Admin Dashboard', 'Kelola Pengguna', 'Profil'].includes(link.name);
    }
    // For non-admin roles
    if (link.role === 'ADMIN') return false;
    return !link.role || link.role === userRole;
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen overflow-hidden bg-muted/30 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-primary tracking-tight">Trashure</span>
          </Link>
          <button onClick={toggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 py-5 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 border border-primary/10">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm truncate">{userName}</span>
              <span className="text-xs text-primary font-bold uppercase tracking-wider">{userRole}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4">
          <div className="space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href || location.pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b bg-card lg:hidden sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Leaf className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg text-primary">Trashure</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
