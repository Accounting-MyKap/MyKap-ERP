import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Fix: The useAuth hook is exported from hooks/useAuth, not contexts/AuthContext.
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProspectsPage from './pages/prospects/ProspectsPage';
import SettingsPage from './pages/SettingsPage';
import LoansPage from './pages/loans/LoansPage';
import LoanDetailPage from './pages/loans/LoanDetailPage';
import LendersPage from './pages/lenders/LendersPage';

/**
 * A wrapper for routes that require authentication.
 * It checks for an active session and redirects to the login page if the user is not authenticated.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-semibold text-gray-700">Loading Application...</div>
      </div>
    );
  }

  if (!session) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to so we can send them there after they login.
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/prospects" element={<ProspectsPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/loans/:loanId" element={<LoanDetailPage />} />
              <Route path="/lenders" element={<LendersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Add other protected routes here for Credits, Lenders, etc. */}
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

               {/* Fallback for any other authenticated route not matched */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;