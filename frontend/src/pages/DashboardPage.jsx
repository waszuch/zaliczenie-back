import React, { useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import RoomList from '@/components/RoomList';
import BookingList from '@/components/BookingList';
import AddRoomForm from '@/components/AddRoomForm';
import { LogOut, User, Shield, Calendar, Building, History } from 'lucide-react';

const DashboardPage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    // Ten klucz będzie służył do "siłowego" odświeżenia komponentów po zmianach
    const [refreshKey, setRefreshKey] = useState(0);

    const handleDataChange = useCallback(() => {
        setRefreshKey(oldKey => oldKey + 1);
    }, []);

    const goToCalendar = () => {
        navigate('/calendar');
    };

    const goToHistory = () => {
        navigate('/history');
    };

    return (
        <div className="app-container">
            <header className="dashboard-header">
                <div className="user-info">
                    <h2>
                        <User size={24} style={{ display: 'inline', marginRight: '8px' }} />
                        Witaj, {user?.username}!
                    </h2>
                    <div className="user-role">
                        {user?.role === 'admin' ? (
                            <Shield size={16} />
                        ) : (
                            <User size={16} />
                        )}
                        {user?.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                    </div>
                </div>
                <div className="header-actions">
                    <button 
                        onClick={goToCalendar} 
                        className="btn btn-primary"
                    >
                        <Calendar size={20} />
                        Kalendarz
                    </button>
                    <button 
                        onClick={goToHistory} 
                        className="btn btn-secondary"
                    >
                        <History size={20} />
                        Historia
                    </button>
                    <button onClick={logout} className="btn btn-secondary">
                        <LogOut size={20} />
                        Wyloguj się
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <main className="main-content">
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">
                                <Building size={24} />
                                Dostępne sale
                            </h3>
                        </div>
                        <div className="section-content">
                            <RoomList key={`rooms-${refreshKey}`} onDataChange={handleDataChange} />
                        </div>
                    </div>
                </main>

                <aside className="sidebar-content">
                    {user.role === 'admin' && (
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">
                                    <Building size={24} />
                                    Dodaj salę
                                </h3>
                            </div>
                            <div className="section-content">
                                <AddRoomForm onRoomAdded={handleDataChange} />
                            </div>
                        </div>
                    )}

                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title">
                                <Calendar size={24} />
                                Rezerwacje
                            </h3>
                        </div>
                        <div className="section-content">
                            <BookingList key={`bookings-${refreshKey}`} />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default DashboardPage; 