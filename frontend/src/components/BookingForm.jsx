import React, { useState } from 'react';
import api from '@/services/api';
import { Clock, Calendar, CheckCircle, AlertCircle, CalendarCheck } from 'lucide-react';

const BookingForm = ({ roomId, onBookingSuccess }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

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
            setError('Nie można rezerwować sal w przeszłości.');
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/bookings', {
                roomId,
                startTime,
                endTime
            });
            setSuccess('Sala została pomyślnie zarezerwowana!');
            setStartTime('');
            setEndTime('');
            
            setTimeout(() => {
                setSuccess('');
                if (onBookingSuccess) onBookingSuccess();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rezerwacji.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Ustaw minimalną datę na dzisiaj
    const now = new Date();
    const today = now.toISOString().slice(0, 16);

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CalendarCheck size={20} className="text-primary-600" />
                Nowa rezerwacja
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">
                            <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Data rozpoczęcia
                        </label>
                        <input 
                            type="datetime-local" 
                            className="form-input"
                            value={startTime} 
                            onChange={e => setStartTime(e.target.value)} 
                            min={today}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">
                            <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Data zakończenia
                        </label>
                        <input 
                            type="datetime-local" 
                            className="form-input"
                            value={endTime} 
                            onChange={e => setEndTime(e.target.value)} 
                            min={startTime || today}
                            required 
                        />
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <CheckCircle size={20} />
                        {success}
                    </div>
                )}

                <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="spinner" />
                            Rezerwuję...
                        </>
                    ) : (
                        <>
                            <CalendarCheck size={20} />
                            Zarezerwuj salę
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default BookingForm; 