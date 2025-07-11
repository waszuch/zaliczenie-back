import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
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
          <Route path="/" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
