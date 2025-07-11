import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Dzięki proxy w vite.config.js, to zostanie przekierowane do http://localhost:3000/api
});

// Interceptor, który dodaje token do każdego żądania
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api; 