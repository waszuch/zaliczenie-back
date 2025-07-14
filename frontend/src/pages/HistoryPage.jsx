import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { 
    ArrowLeft, 
    History, 
    User, 
    Shield, 
    LogOut, 
    Search,
    Filter,
    Calendar,
    Clock,
    MapPin,
    ChevronDown,
    ChevronUp,
    Edit3,
    Trash2,
    X,
    Users
} from 'lucide-react';

const HistoryPage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('all');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, upcoming, past
    const [sortOrder, setSortOrder] = useState('desc'); // desc, asc
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchBookings();
        fetchUsers();
    }, [selectedUserId]);

    useEffect(() => {
        filterAndSortBookings();
    }, [bookings, searchTerm, filterStatus, sortOrder]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = {};
            
            // Dodaj filtr użytkownika dla adminów
            if (user?.role === 'admin' && selectedUserId) {
                params.userId = selectedUserId;
            }
            
            const response = await api.get('/bookings', { params });
            setBookings(response.data);
        } catch (error) {
            console.error('Błąd podczas pobierania historii rezerwacji:', error);
        } finally {
            setLoading(false);
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

    const handleUserChange = (userId) => {
        setSelectedUserId(userId);
        setCurrentPage(1); // Reset pagination
    };

    const filterAndSortBookings = () => {
        let filtered = [...bookings];
        const now = new Date();

        // Filtrowanie po statusie
        if (filterStatus === 'upcoming') {
            filtered = filtered.filter(booking => new Date(booking.start_time) > now);
        } else if (filterStatus === 'past') {
            filtered = filtered.filter(booking => new Date(booking.end_time) < now);
        }

        // Wyszukiwanie
        if (searchTerm) {
            if (user?.role === 'admin') {
                // Admin może szukać po nazwie sali i nazwie użytkownika
                filtered = filtered.filter(booking =>
                    booking.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (booking.username && booking.username.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            } else {
                // Zwykły użytkownik szuka tylko po nazwie sali
                filtered = filtered.filter(booking =>
                    booking.room_name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
        }

        // Sortowanie
        filtered.sort((a, b) => {
            const dateA = new Date(a.start_time);
            const dateB = new Date(b.start_time);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setFilteredBookings(filtered);
        setCurrentPage(1); // Reset pagination when filtering
    };

    const getStatusBadge = (booking) => {
        const now = new Date();
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);

        if (endTime < now) {
            return <span className="status-badge past">Zakończone</span>;
        } else if (startTime <= now && endTime >= now) {
            return <span className="status-badge active">W trakcie</span>;
        } else {
            return <span className="status-badge upcoming">Nadchodzące</span>;
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('pl-PL'),
            time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getDuration = (startTime, endTime) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        } else {
            return `${diffMinutes}m`;
        }
    };

    const goBackToDashboard = () => {
        navigate('/dashboard');
    };

    const goToCalendar = () => {
        navigate('/calendar');
    };

    // Paginacja
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookings.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="history-page">
                <div className="loading">Ładowanie historii rezerwacji...</div>
            </div>
        );
    }

    return (
        <div className="history-page">
            {/* Header */}
            <header className="history-page-header">
                <div className="history-page-nav">
                    <button onClick={goBackToDashboard} className="btn btn-secondary">
                        <ArrowLeft size={20} />
                        Dashboard
                    </button>
                    <button onClick={goToCalendar} className="btn btn-secondary">
                        <Calendar size={20} />
                        Kalendarz
                    </button>
                    <div className="history-page-title">
                        <History size={28} />
                        <h1>Historia Rezerwacji</h1>
                    </div>
                </div>
                
                <div className="history-page-user">
                    <div className="user-info">
                        <span className="user-name">
                            {user?.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
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

            {/* Filtr użytkowników dla adminów */}
            {user?.role === 'admin' && (
                <div className="history-user-filter">
                    <div className="user-filter">
                        <Users size={20} />
                        <label htmlFor="user-select-history">Filtruj według użytkownika:</label>
                        <select 
                            id="user-select-history"
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

            {/* Filtry i wyszukiwarka */}
            <div className="history-controls">
                <div className="search-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder={user?.role === 'admin' 
                                ? "Szukaj po nazwie sali lub użytkowniku..." 
                                : "Szukaj po nazwie sali..."
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="clear-search">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        <Filter size={20} />
                        Filtry
                        {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                {showFilters && (
                    <div className="filters-section">
                        <div className="filter-group">
                            <label>Status:</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="all">Wszystkie</option>
                                <option value="upcoming">Nadchodzące</option>
                                <option value="past">Zakończone</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Sortowanie:</label>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                <option value="desc">Najnowsze pierwsze</option>
                                <option value="asc">Najstarsze pierwsze</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Statystyki */}
            <div className="history-stats">
                <div className="stat-card">
                    <span className="stat-number">{filteredBookings.length}</span>
                    <span className="stat-label">
                        {searchTerm || filterStatus !== 'all' ? 'Przefiltrowane' : 'Wszystkich'} rezerwacji
                    </span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">
                        {filteredBookings.filter(b => new Date(b.end_time) < new Date()).length}
                    </span>
                    <span className="stat-label">Zakończone</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">
                        {filteredBookings.filter(b => new Date(b.start_time) > new Date()).length}
                    </span>
                    <span className="stat-label">Nadchodzące</span>
                </div>
            </div>

            {/* Lista rezerwacji */}
            <main className="history-content">
                {currentBookings.length === 0 ? (
                    <div className="empty-state">
                        <History size={64} />
                        <h3>Brak rezerwacji</h3>
                        <p>
                            {searchTerm || filterStatus !== 'all' 
                                ? `Nie znaleziono rezerwacji pasujących do filtrów.${searchTerm ? ' Spróbuj wyszukać inną nazwę sali.' : ''}`
                                : user?.role === 'admin' 
                                    ? 'Brak rezerwacji dla wybranego użytkownika.'
                                    : 'Nie masz jeszcze żadnych rezerwacji.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {currentBookings.map(booking => {
                            const startDateTime = formatDateTime(booking.start_time);
                            const endDateTime = formatDateTime(booking.end_time);
                            const duration = getDuration(booking.start_time, booking.end_time);

                            return (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-header">
                                        <div className="booking-room">
                                            <MapPin size={20} />
                                            <h3>{booking.room_name}</h3>
                                        </div>
                                        {getStatusBadge(booking)}
                                    </div>

                                    <div className="booking-details">
                                        <div className="booking-time">
                                            <Clock size={16} />
                                            <div className="time-info">
                                                <span className="date">{startDateTime.date}</span>
                                                <span className="time-range">
                                                    {startDateTime.time} - {endDateTime.time}
                                                </span>
                                                <span className="duration">({duration})</span>
                                            </div>
                                        </div>

                                        {user?.role === 'admin' && booking.username && (
                                            <div className="booking-user">
                                                <User size={16} />
                                                <span>Zarezerwowane przez: <strong>{booking.username}</strong></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="booking-meta">
                                        <span className="booking-id">ID: {booking.id}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Paginacja */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button 
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="btn btn-secondary"
                        >
                            Poprzednia
                        </button>
                        
                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`btn ${page === currentPage ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="btn btn-secondary"
                        >
                            Następna
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HistoryPage; 