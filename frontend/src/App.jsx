import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import CalendarPage from '@/pages/CalendarPage';
import HistoryPage from '@/pages/HistoryPage';
import { Building2 } from 'lucide-react';
import '@/App.css';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container">
        {!user && (
          <div className="app-header">
            <div className="auth-logo">
              <Building2 size={40} color="white" />
            </div>
            <h1 className="app-title">RoomBooker</h1>
            <p className="app-subtitle">
              Profesjonalny system rezerwacji sal konferencyjnych
            </p>
          </div>
        )}
        
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/calendar" element={user ? <CalendarPage /> : <Navigate to="/login" />} />
          <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
