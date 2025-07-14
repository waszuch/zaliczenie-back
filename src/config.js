require('dotenv').config();

module.exports = {
    db: {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_DATABASE || 'booking_system',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
    },
    jwtSecret: process.env.JWT_SECRET || 'bardzo_tajny_klucz',
    port: process.env.PORT || 3000,
}; 