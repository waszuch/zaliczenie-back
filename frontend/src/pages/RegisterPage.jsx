import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { UserPlus, User, Lock, AlertCircle, CheckCircle, Building2 } from 'lucide-react';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        
        try {
            await api.post('/auth/register', { username, password });
            setSuccess('Rejestracja pomyślna! Możesz się teraz zalogować.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas rejestracji.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <Building2 size={40} color="white" />
                    </div>
                    <h2 className="auth-title">Dołącz do nas!</h2>
                    <p className="auth-subtitle">Utwórz swoje konto</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">
                            <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Nazwa użytkownika
                        </label>
                        <input 
                            type="text" 
                            className="form-input"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                            placeholder="Wybierz nazwę użytkownika"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                            Hasło
                        </label>
                        <input 
                            type="password" 
                            className="form-input"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Utwórz bezpieczne hasło"
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
                        className="btn btn-primary btn-lg w-full" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner" />
                                Rejestrowanie...
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Zarejestruj się
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="text-gray-600">
                        Masz już konto? {' '}
                        <Link to="/login" className="auth-link">
                            Zaloguj się
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage; 