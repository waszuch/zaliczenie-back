import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import CalendarView from '@/components/CalendarView';
import api from '@/services/api';
import { ArrowLeft, Calendar, User, Shield, LogOut, Users, Filter } from 'lucide-react';

const CalendarPage = () => {
    const { user, logout } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('all');
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();

    const handleDataChange = () => {
        setRefreshKey(oldKey => oldKey + 1);
        fetchRooms();
    };

    const fetchRooms = async () => {
        try {
            const response = await api.get('/rooms');
            setRooms(response.data);
        } catch (err) {
            console.error('Błąd podczas pobierania sal:', err);
        }
    };

    const fetchUsers = async () => {
        if (user?.role !== 'admin') return;
        
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Błąd podczas pobierania użytkowników:', err);
        }
    };

    useEffect(() => {
        fetchRooms();
        fetchUsers();
    }, [user?.role]);

    const goBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handleUserChange = (userId) => {
        setSelectedUserId(userId);
        setRefreshKey(oldKey => oldKey + 1);
    };

    return (
        <div className="calendar-page">
            <header className="calendar-page-header">
                <div className="calendar-page-nav">
                    <button 
                        onClick={goBackToDashboard} 
                        className="btn btn-secondary"
                    >
                        <ArrowLeft size={20} />
                        Powrót do Dashboard
                    </button>
                    <div className="calendar-page-title">
                        <Calendar size={28} />
                        <h1>Kalendarz Rezerwacji</h1>
                    </div>
                </div>
                
                <div className="calendar-page-user">
                    <div className="user-info">
                        <span className="user-name">
                            {user?.role === 'admin' ? (
                                <Shield size={16} />
                            ) : (
                                <User size={16} />
                            )}
                            {user?.username}
                        </span>
                        <span className="user-role-badge">
                            {user?.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                        </span>
                    </div>
                    <button onClick={logout} className="btn btn-secondary">
                        <LogOut size={20} />
                        Wyloguj
                    </button>
                </div>
            </header>

            {user?.role === 'admin' && (
                <div className="calendar-filters">
                    <div className="user-filter">
                        <Filter size={20} />
                        <label htmlFor="user-select">Filtruj według użytkownika:</label>
                        <select 
                            id="user-select"
                            value={selectedUserId} 
                            onChange={(e) => handleUserChange(e.target.value)}
                            className="user-select"
                        >
                            <option value="all">Wszyscy użytkownicy</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.bookings_count} rezerwacji)
                                </option>
                            ))}
                        </select>
                        <div className="filter-info">
                            {selectedUserId === 'all' 
                                ? 'Wyświetlane są rezerwacje wszystkich użytkowników'
                                : `Wyświetlane są rezerwacje użytkownika: ${users.find(u => u.id == selectedUserId)?.username || 'Nieznany'}`
                            }
                        </div>
                    </div>
                </div>
            )}

            <main className="calendar-page-content">
                <CalendarView 
                    rooms={rooms} 
                    onDataChange={handleDataChange}
                    selectedUserId={selectedUserId}
                    key={`calendar-${refreshKey}`}
                />
            </main>
        </div>
    );
};

export default CalendarPage; 