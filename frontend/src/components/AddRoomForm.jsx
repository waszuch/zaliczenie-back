import React, { useState } from 'react';
import api from '@/services/api';
import { Plus, Building, Users, AlertCircle, CheckCircle } from 'lucide-react';

const AddRoomForm = ({ onRoomAdded }) => {
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!name.trim()) {
            setError('Nazwa sali jest wymagana.');
            setIsLoading(false);
            return;
        }

        if (!capacity || parseInt(capacity) <= 0) {
            setError('Pojemność musi być liczbą większą od 0.');
            setIsLoading(false);
            return;
        }

        try {
            await api.post('/rooms', { name: name.trim(), capacity: parseInt(capacity) });
            setName('');
            setCapacity('');
            setSuccess('Sala została pomyślnie dodana!');
            
            setTimeout(() => {
                setSuccess('');
            }, 3000);
            
            if (onRoomAdded) onRoomAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Nie udało się dodać sali.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label className="form-label">
                        <Building size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Nazwa sali
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="np. Sala konferencyjna A1"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">
                        <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        Pojemność (liczba osób)
                    </label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="np. 12"
                        value={capacity}
                        onChange={e => setCapacity(e.target.value)}
                        min="1"
                        required
                    />
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
                    className="btn btn-primary w-full"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="spinner" />
                            Dodawanie...
                        </>
                    ) : (
                        <>
                            <Plus size={20} />
                            Dodaj salę
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddRoomForm; 