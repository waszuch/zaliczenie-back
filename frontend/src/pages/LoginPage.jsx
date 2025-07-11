import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import api from '@/services/api';
import { LogIn, User, Lock, AlertCircle, Building2 } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await api.post('/auth/login', { username, password });
            login(response.data.user, response.data.token);
        } catch (err) {
            setError('Błędna nazwa użytkownika lub hasło.');
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
                    <h2 className="auth-title">Witaj ponownie!</h2>
                    <p className="auth-subtitle">Zaloguj się do swojego konta</p>
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
                            placeholder="Wprowadź nazwę użytkownika"
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
                            placeholder="Wprowadź hasło"
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={20} />
                            {error}
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
                                Logowanie...
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Zaloguj się
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p className="text-gray-600">
                        Nie masz konta? {' '}
                        <Link to="/register" className="auth-link">
                            Zarejestruj się
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 