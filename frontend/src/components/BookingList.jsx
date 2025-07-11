import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import { 
    Calendar, 
    Clock, 
    User, 
    MapPin, 
    Edit3, 
    Trash2, 
    Save, 
    X, 
    AlertCircle,
    CalendarX,
    CheckCircle
} from 'lucide-react';

const EditBookingForm = ({ booking, rooms, onUpdate, onCancel }) => {
    const [roomId, setRoomId] = useState(booking.room_id);
    const [startTime, setStartTime] = useState(new Date(booking.start_time).toISOString().slice(0, 16));
    const [endTime, setEndTime] = useState(new Date(booking.end_time).toISOString().slice(0, 16));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Ustaw minimalną datę na teraz
    const now = new Date();
    const today = now.toISOString().slice(0, 16);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Walidacja dat
        if (!startTime || !endTime) {
            setError('Oba pola daty są wymagane.');
            setIsLoading(false);
            return;
        }
        
        if (new Date(startTime) >= new Date(endTime)) {
            setError('Data zakończenia musi być późniejsza niż data rozpoczęcia.');
            setIsLoading(false);
            return;
        }

        // Sprawdź czy data nie jest w przeszłości
        if (new Date(startTime) < new Date()) {
            setError('Nie można przebookować na termin w przeszłości.');
            setIsLoading(false);
            return;
        }
        
        try {
            await api.put(`/bookings/${booking.id}`, { roomId, startTime, endTime });
            onUpdate();
        } catch (error) {
            setError(error.response?.data?.message || 'Nie udało się zaktualizować rezerwacji');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Edit3 size={16} />
                Edytuj rezerwację
            </h5>
            
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="form-group">
                    <label className="form-label">Sala</label>
                    <select 
                        value={roomId} 
                        onChange={e => setRoomId(e.target.value)}
                        className="form-select"
                    >
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="form-group">
                        <label className="form-label">Początek</label>
                        <input 
                            type="datetime-local" 
                            value={startTime} 
                            onChange={e => setStartTime(e.target.value)}
                            className="form-input"
                            min={today}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Koniec</label>
                        <input 
                            type="datetime-local" 
                            value={endTime} 
                            onChange={e => setEndTime(e.target.value)}
                            className="form-input"
                            min={startTime || today}
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
                
                <div className="flex gap-2">
                    <button 
                        type="submit" 
                        className="btn btn-success btn-sm"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner" />
                                Zapisywanie...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Zapisz
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="btn btn-secondary btn-sm"
                    >
                        <X size={16} />
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
};

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');
    const [editingBookingId, setEditingBookingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchBookings = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/bookings');
            setBookings(res.data);
        } catch (err) {
            setError('Nie udało się pobrać listy rezerwacji.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const fetchRooms = useCallback(async () => {
        try {
            const res = await api.get('/rooms');
            setRooms(res.data);
        } catch (err) {
            console.error('Błąd pobierania salek', err);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
        fetchRooms(); // Wszyscy użytkownicy mogą pobrać sale do edycji rezerwacji
    }, [fetchBookings, fetchRooms]);

    const handleDelete = async (id) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
            } catch (err) {
                alert('Nie udało się usunąć rezerwacji.');
            }
        }
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="text-center p-6">
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p className="text-gray-600 mt-4">Ładowanie rezerwacji...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <AlertCircle size={20} />
                {error}
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center p-6">
                <CalendarX size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Brak rezerwacji</p>
                <p className="text-sm text-gray-500 mt-2">
                    Zarezerwuj swoją pierwszą salę
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map(booking => (
                <div key={booking.id} className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                                    <MapPin size={18} className="text-primary-600" />
                                    {booking.room_name}
                                </h4>
                                
                                {booking.username && (
                                    <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                                        <User size={16} />
                                        Zarezerwowane przez: {booking.username}
                                    </p>
                                )}
                                
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Calendar size={16} />
                                        Od: {formatDateTime(booking.start_time)}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                        <Clock size={16} />
                                        Do: {formatDateTime(booking.end_time)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Edycja - użytkownik może edytować swoje rezerwacje, admin wszystkie */}
                            {(user.role === 'admin' || booking.user_id === user.id) && (
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setEditingBookingId(booking.id)} 
                                        className="btn btn-sm btn-secondary"
                                        title="Edytuj rezerwację"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    
                                    {/* Tylko admin może usuwać rezerwacje */}
                                    {user.role === 'admin' && (
                                        <button 
                                            onClick={() => handleDelete(booking.id)} 
                                            className="btn btn-sm btn-danger"
                                            title="Usuń rezerwację"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {editingBookingId === booking.id && (
                            <EditBookingForm 
                                booking={booking} 
                                rooms={rooms} 
                                onUpdate={() => {
                                    setEditingBookingId(null);
                                    fetchBookings();
                                }}
                                onCancel={() => setEditingBookingId(null)}
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookingList; 