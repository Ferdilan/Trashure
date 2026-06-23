import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase/client';
import type { Session } from '@supabase/supabase-js';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GuidePage from './pages/GuidePage';

// Dashboard
import DashboardPage from './pages/DashboardPage';
import DashboardFeedPage from './pages/DashboardFeedPage';
import DashboardListingsPage from './pages/DashboardListingsPage';
import DashboardListingsNewPage from './pages/DashboardListingsNewPage';
import DashboardListingsidDetailPage from './pages/DashboardListingsidDetailPage';
import DashboardTransactionsPage from './pages/DashboardTransactionsPage';
import DashboardWalletPage from './pages/DashboardWalletPage';
import DashboardProfilePage from './pages/DashboardProfilePage';
import DashboardPickupPage from './pages/DashboardPickupPage';
import DashboardChattransactionIdDetailPage from './pages/DashboardChattransactionIdDetailPage';

import DashboardLayout from './components/DashboardLayout';

// Admin
import AdminPage from './pages/AdminPage';
import AdminUsersPage from './pages/AdminUsersPage';

// Komponen pelindung route — redirect ke /login jika belum login
function ProtectedRoute({ session, children }: { session: Session | null | undefined, children: React.ReactNode }) {
  if (session === undefined) {
    // Masih memuat sesi dari localStorage — tampilkan loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  // undefined = sedang cek sesi, null = belum login, Session = sudah login
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    // Ambil sesi yang tersimpan di localStorage saat app pertama dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Dengarkan perubahan sesi (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Bersihkan listener saat komponen unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/panduan" element={<GuidePage />} />
          <Route path="/login" element={
            // Jika sudah login, langsung arahkan ke dashboard
            session ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/register" element={
            session ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          } />
          
          {/* Semua route dashboard dilindungi */}
          <Route path="/dashboard" element={
            <ProtectedRoute session={session}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="feed" element={<DashboardFeedPage />} />
            <Route path="listings" element={<DashboardListingsPage />} />
            <Route path="listings/new" element={<DashboardListingsNewPage />} />
            <Route path="listings/:id" element={<DashboardListingsidDetailPage />} />
            <Route path="transactions" element={<DashboardTransactionsPage />} />
            <Route path="wallet" element={<DashboardWalletPage />} />
            <Route path="profile" element={<DashboardProfilePage />} />
            <Route path="pickup" element={<DashboardPickupPage />} />
            <Route path="chat/:transactionId" element={<DashboardChattransactionIdDetailPage />} />
            
            {/* Admin Routes nested inside layout */}
            <Route path="admin" element={<AdminPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="/admin/users" element={<Navigate to="/dashboard/admin/users" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

