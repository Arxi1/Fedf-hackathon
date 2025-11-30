import React, { useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';

// Import all dashboard components
import Login from './pages/Login';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import AdminDashboard from './pages/AdminDashboard';

// --- Navigation Component ---
const Navigation = ({ role, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const getDashboardPath = () => {
    switch (role) {
      case 'donor': return '/donor';
      case 'recipient': return '/recipient';
      case 'analyst': return '/analyst';
      case 'admin': return '/admin';
      default: return '/';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
      <div className="container-fluid">
        <Link to={getDashboardPath()} className="navbar-brand">
          <i className="fas fa-utensils me-2"></i>
          FoodConnect
        </Link>
        <span className="badge bg-light text-dark ms-2">
          {role.toUpperCase()} Dashboard
        </span>
        <div className="navbar-nav ms-auto">
          <Link to={getDashboardPath()} className="nav-link">
            <Home size={16} className="me-1" />
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-outline-light ms-2"
          >
            <LogOut size={16} className="me-1" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- Protected Route Component ---
const ProtectedRoute = ({ children, role, requiredRole }) => {
  if (!role) {
    return <Navigate to="/" replace />;
  }
  if (role !== requiredRole) {
    return <Navigate to={`/${role}`} replace />;
  }
  return children;
};

// --- Main Application Component ---
function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const handleLogout = () => {
    setRole(null);
    setUser(null);
  };

  return (
    <div className="app-root">
      <div style={{ padding: '20px', textAlign: 'center', fontSize: '24px', color: '#667eea', fontWeight: 'bold' }}>
        FoodConnect App is Loading...
      </div>
      {role && <Navigation role={role} user={user} onLogout={handleLogout} />}

      <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              role ? <Navigate to={`/${role}`} replace /> : <Login onSelectRole={setRole} onLogin={setUser} />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/donor/*"
            element={
              <ProtectedRoute role={role} requiredRole="donor">
                <DonorDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipient/*"
            element={
              <ProtectedRoute role={role} requiredRole="recipient">
                <RecipientDashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analyst/*"
            element={
              <ProtectedRoute role={role} requiredRole="analyst">
                <AnalystDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role={role} requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}export default App;
