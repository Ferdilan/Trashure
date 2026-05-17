import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/panduan" element={<GuidePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={<DashboardLayout />}>
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
