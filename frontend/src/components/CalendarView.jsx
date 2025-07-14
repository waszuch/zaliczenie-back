import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    Edit3, 
    Trash2, 
    Save, 
    X, 
    Plus,
    User,
    MapPin,
    Clock
} from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0:00 - 23:00
const DAYS = ['Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob', 'Nie'];

const CalendarView = ({ rooms, onDataChange, selectedUserId }) => {
    const { user } = useContext(AuthContext);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBooking, setEditingBooking] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Pobierz datę początku i końca tygodnia
    const getWeekRange = (date) => {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // dostosowanie dla poniedziałku jako pierwszego dnia
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        
        return { start, end };
    };

    // Pobierz dni tygodnia
    const getWeekDays = (startDate) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const fetchCalendarBookings = async () => {
        try {
            setLoading(true);
            const { start, end } = getWeekRange(currentWeek);
            const params = {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            };
            
            // Dodaj filtr użytkownika dla adminów
            if (user?.role === 'admin' && selectedUserId) {
                params.userId = selectedUserId;
            }
            
            const response = await api.get('/bookings/calendar', { params });
            setBookings(response.data);
        } catch (error) {
            console.error('Błąd podczas pobierania rezerwacji kalendarza:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendarBookings();
    }, [currentWeek, selectedUserId]); // Dodano selectedUserId do dependencies

    // Nawigacja tygodni
    const goToPreviousWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeek(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeek(newDate);
    };

    const goToCurrentWeek = () => {
        setCurrentWeek(new Date());
    };

    // Sprawdź czy rezerwacja mieści się w danym slonie
    const getBookingForSlot = (dayDate, hour) => {
        return bookings.filter(booking => {
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);
            const slotStart = new Date(dayDate);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(slotStart);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            return startTime < slotEnd && endTime > slotStart;
        });
    };

    // Formatowanie czasu
    const formatTime = (timeString) => {
        return new Date(timeString).toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obsługa kliknięcia w pustą komórkę (tylko dla admina)
    const handleSlotClick = (dayDate, hour) => {
        if (user?.role !== 'admin') return;

        const slotStart = new Date(dayDate);
        slotStart.setHours(hour, 0, 0, 0);
        
        // Sprawdź czy slot nie jest w przeszłości
        if (slotStart < new Date()) return;

        setSelectedSlot({ date: dayDate, hour });
        setIsCreating(true);
    };

    // Obsługa edycji rezerwacji
    const handleEditBooking = (booking) => {
        if (user?.role !== 'admin' && booking.user_id !== user?.id) return;
        setEditingBooking(booking);
    };

    // Zapisz edytowaną rezerwację
    const saveEditedBooking = async (bookingData) => {
        try {
            await api.put(`/bookings/${editingBooking.id}`, bookingData);
            setEditingBooking(null);
            fetchCalendarBookings();
            onDataChange && onDataChange();
        } catch (error) {
            console.error('Błąd podczas edycji rezerwacji:', error);
            alert('Błąd podczas zapisywania zmian');
        }
    };

    // Usuń rezerwację (tylko admin)
    const deleteBooking = async (bookingId) => {
        if (user?.role !== 'admin') return;
        
        if (window.confirm('Czy na pewno chcesz usunąć tę rezerwację?')) {
            try {
                await api.delete(`/bookings/${bookingId}`);
                fetchCalendarBookings();
                onDataChange && onDataChange();
            } catch (error) {
                console.error('Błąd podczas usuwania rezerwacji:', error);
                alert('Błąd podczas usuwania rezerwacji');
            }
        }
    };

    // Stwórz nową rezerwację
    const createBooking = async (bookingData) => {
        try {
            await api.post('/bookings', bookingData);
            setIsCreating(false);
            setSelectedSlot(null);
            fetchCalendarBookings();
            onDataChange && onDataChange();
        } catch (error) {
            console.error('Błąd podczas tworzenia rezerwacji:', error);
            alert('Błąd podczas tworzenia rezerwacji');
        }
    };

    const { start: weekStart } = getWeekRange(currentWeek);
    const weekDays = getWeekDays(weekStart);

    if (loading) {
        return <div className="loading">Ładowanie kalendarza...</div>;
    }

    return (
        <div className="calendar-view">
            {/* Nagłówek kalendarza */}
            <div className="calendar-header">
                <div className="calendar-navigation">
                    <button onClick={goToPreviousWeek} className="btn btn-sm">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={goToCurrentWeek} className="btn btn-primary btn-sm">
                        Dzisiaj
                    </button>
                    <button onClick={goToNextWeek} className="btn btn-sm">
                        <ChevronRight size={16} />
                    </button>
                </div>
                <h3 className="calendar-title">
                    <Calendar size={20} />
                    Kalendarz rezerwacji - {weekStart.toLocaleDateString('pl-PL')} - {weekDays[6].toLocaleDateString('pl-PL')}
                </h3>
            </div>

            {/* Grid kalendarza */}
            <div className="calendar-grid">
                {/* Nagłówek z dniami */}
                <div className="calendar-grid-header">
                    <div className="time-column-header">Godzina</div>
                    {weekDays.map((day, index) => (
                        <div key={index} className={`day-header ${day.toDateString() === new Date().toDateString() ? 'today' : ''}`}>
                            <div className="day-name">{DAYS[index]}</div>
                            <div className="day-date">{day.getDate()}</div>
                        </div>
                    ))}
                </div>

                {/* Rzędy z godzinami */}
                <div className="calendar-grid-body">
                    {HOURS.map(hour => (
                        <div key={hour} className="calendar-row">
                            <div className="time-cell">
                                {hour}:00
                            </div>
                            {weekDays.map((day, dayIndex) => {
                                const dayBookings = getBookingForSlot(day, hour);
                                const isEmpty = dayBookings.length === 0;
                                const isPast = new Date(day).setHours(hour) < new Date();
                                
                                return (
                                    <div 
                                        key={dayIndex} 
                                        className={`calendar-cell ${isEmpty ? 'empty' : 'has-booking'} ${isPast ? 'past' : ''}`}
                                        onClick={() => isEmpty && !isPast && handleSlotClick(day, hour)}
                                    >
                                        {dayBookings.map(booking => (
                                            <div 
                                                key={booking.id} 
                                                className={`booking-item ${user?.role === 'admin' || booking.user_id === user?.id ? 'editable' : 'readonly'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditBooking(booking);
                                                }}
                                            >
                                                <div className="booking-room">{booking.room_name}</div>
                                                <div className="booking-user">{booking.username}</div>
                                                <div className="booking-time">
                                                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                                </div>
                                                {(user?.role === 'admin' || booking.user_id === user?.id) && (
                                                    <div className="booking-actions">
                                                        <Edit3 size={12} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {isEmpty && !isPast && user?.role === 'admin' && (
                                            <div className="empty-slot">
                                                <Plus size={16} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal do edycji rezerwacji */}
            {editingBooking && (
                <BookingEditModal
                    booking={editingBooking}
                    rooms={rooms}
                    onSave={saveEditedBooking}
                    onCancel={() => setEditingBooking(null)}
                    onDelete={deleteBooking}
                    isAdmin={user?.role === 'admin'}
                />
            )}

            {/* Modal do tworzenia rezerwacji */}
            {isCreating && selectedSlot && (
                <BookingCreateModal
                    selectedSlot={selectedSlot}
                    rooms={rooms}
                    onCreate={createBooking}
                    onCancel={() => {
                        setIsCreating(false);
                        setSelectedSlot(null);
                    }}
                />
            )}
        </div>
    );
};

// Modal do edycji rezerwacji
const BookingEditModal = ({ booking, rooms, onSave, onCancel, onDelete, isAdmin }) => {
    const [roomId, setRoomId] = useState(booking.room_id);
    const [startTime, setStartTime] = useState(new Date(booking.start_time).toISOString().slice(0, 16));
    const [endTime, setEndTime] = useState(new Date(booking.end_time).toISOString().slice(0, 16));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            roomId: parseInt(roomId),
            startTime,
            endTime
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Edytuj rezerwację</h3>
                    <button onClick={onCancel} className="btn btn-sm">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Sala:</label>
                        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name} (pojemność: {room.capacity})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Od:</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Do:</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">
                            <Save size={16} />
                            Zapisz
                        </button>
                        {isAdmin && (
                            <button 
                                type="button" 
                                onClick={() => onDelete(booking.id)}
                                className="btn btn-danger"
                            >
                                <Trash2 size={16} />
                                Usuń
                            </button>
                        )}
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            Anuluj
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal do tworzenia rezerwacji
const BookingCreateModal = ({ selectedSlot, rooms, onCreate, onCancel }) => {
    const [roomId, setRoomId] = useState(rooms[0]?.id || '');
    const [startTime, setStartTime] = useState(() => {
        const start = new Date(selectedSlot.date);
        start.setHours(selectedSlot.hour, 0, 0, 0);
        return start.toISOString().slice(0, 16);
    });
    const [endTime, setEndTime] = useState(() => {
        const end = new Date(selectedSlot.date);
        end.setHours(selectedSlot.hour + 1, 0, 0, 0);
        return end.toISOString().slice(0, 16);
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({
            roomId: parseInt(roomId),
            startTime,
            endTime
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Nowa rezerwacja</h3>
                    <button onClick={onCancel} className="btn btn-sm">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Sala:</label>
                        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name} (pojemność: {room.capacity})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Od:</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Do:</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn btn-primary">
                            <Plus size={16} />
                            Stwórz
                        </button>
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            Anuluj
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CalendarView; 