import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProspectsProvider } from './contexts/ProspectsContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProspectsPage from './pages/prospects/ProspectsPage';
import LoansPage from './pages/loans/LoansPage';
import LoanDetailPage from './pages/loans/LoanDetailPage';
import LendersPage from './pages/lenders/LendersPage';
import SettingsPage from './pages/SettingsPage';
import LenderDetailPage from './pages/lenders/detail/LenderDetailPage';
import UsersPage from './pages/users/UsersPage';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ui/ToastContainer';

// A custom component to protect routes that require authentication.
const ProtectedRoute: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    // Optionally, show a loading spinner while checking auth state
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    // If there's no session, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If session exists, wrap the child routes in the ProspectsProvider
  // to provide a single, shared state for all prospect/loan data.
  return (
    <ProspectsProvider>
      <Outlet />
    </ProspectsProvider>
  );
};


const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/prospects" element={<ProspectsPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/loans/:loanId" element={<LoanDetailPage />} />
              <Route path="/lenders" element={<LendersPage />} />
              <Route path="/lenders/new" element={<LenderDetailPage />} />
              <Route path="/lenders/:lenderId" element={<LenderDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/users" element={<UsersPage />} />
              {/* Redirect root to dashboard if logged in */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
