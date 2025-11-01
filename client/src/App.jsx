import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import ReportDetail from './pages/ReportDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import UserDashboard from './pages/UserDashboard';
import MayorLogin from './pages/MayorLogin';
import MayorDashboard from './pages/MayorDashboard';
import MayorAlert from './pages/MayorAlert';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, mayorOnly = false, adminOrMayor = false, citizenOnly = false, allRoles = false }) => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect mayors to their dashboard if they try to access non-mayor routes
  // Exception: allRoles flag allows all authenticated users
  if (!mayorOnly && !adminOrMayor && !allRoles && user?.role === 'mayor') {
    return <Navigate to="/mayor/dashboard" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (mayorOnly && user?.role !== 'mayor') {
    return <Navigate to="/mayor/login" replace />;
  }

  if (adminOrMayor && !isAdmin && user?.role !== 'mayor') {
    return <Navigate to="/" replace />;
  }

  if (citizenOnly && (isAdmin || user?.role === 'mayor')) {
    return <Navigate to={user?.role === 'mayor' ? '/mayor/dashboard' : '/admin/dashboard'} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/report"
        element={
          <ProtectedRoute allRoles>
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute citizenOnly>
            <MyReports />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute allRoles>
            <ReportDetail />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute adminOrMayor>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      
      <Route path="/mayor/login" element={<MayorLogin />} />
      
      <Route
        path="/mayor/dashboard"
        element={
          <ProtectedRoute mayorOnly>
            <MayorDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/mayor-alert"
        element={
          <ProtectedRoute mayorOnly>
            <MayorAlert />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/chat"
        element={
          <ProtectedRoute allRoles>
            <Chat />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
