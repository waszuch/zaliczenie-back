import React, { useState, useEffect, useContext } from 'react';
import api from '@/services/api';
import { AuthContext } from '@/context/AuthContext';
import BookingForm from './BookingForm';
import { Users, Calendar, Trash2, Building, MapPin } from 'lucide-react';

const RoomList = ({ onDataChange }) => {
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchRooms = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/rooms');
            setRooms(response.data);
        } catch (err) {
            setError('Nie udało się pobrać listy salek.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleDelete = async (roomId) => {
        if (window.confirm('Czy na pewno chcesz usunąć tę salkę?')) {
            try {
                await api.delete(`/rooms/${roomId}`);
                fetchRooms();
                if (onDataChange) onDataChange();
            } catch (err) {
                alert('Nie udało się usunąć salki.');
                console.error(err);
            }
        }
    };

    const handleBookingSuccess = () => {
        setSelectedRoomId(null);
        if (onDataChange) onDataChange();
    };
    
    if (isLoading) {
        return (
            <div className="text-center p-6">
                <div className="spinner" style={{ margin: '0 auto' }} />
                <p className="text-gray-600 mt-4">Ładowanie sal...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <Building size={20} />
                {error}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center p-6">
                <Building size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Brak dostępnych sal</p>
                {user.role === 'admin' && (
                    <p className="text-sm text-gray-500 mt-2">
                        Dodaj pierwszą salę używając formularza po prawej stronie
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {rooms.map(room => (
                <div key={room.id} className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <MapPin size={20} className="text-primary-600" />
                                    {room.name}
                                </h4>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users size={16} />
                                    <span className="text-sm">Pojemność: {room.capacity} osób</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
                                    className={`btn btn-sm ${selectedRoomId === room.id ? 'btn-secondary' : 'btn-primary'}`}
                                >
                                    <Calendar size={16} />
                                    {selectedRoomId === room.id ? 'Anuluj' : 'Rezerwuj'}
                                </button>
                                
                                {user.role === 'admin' && (
                                    <button 
                                        onClick={() => handleDelete(room.id)} 
                                        className="btn btn-sm btn-danger"
                                        title="Usuń salę"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {selectedRoomId === room.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <BookingForm 
                                    roomId={room.id} 
                                    onBookingSuccess={handleBookingSuccess}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RoomList; 