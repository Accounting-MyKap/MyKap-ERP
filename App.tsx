import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProspectsPage from './pages/prospects/ProspectsPage';
import LoansPage from './pages/loans/LoansPage';
import LoanDetailPage from './pages/loans/LoanDetailPage';
import LendersPage from './pages/lenders/LendersPage';
import SettingsPage from './pages/SettingsPage';

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

  // If session exists, render the child routes
  return <Outlet />;
};


const App: React.FC = () => {
  return (
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
            <Route path="/settings" element={<SettingsPage />} />
            {/* Redirect root to dashboard if logged in */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
