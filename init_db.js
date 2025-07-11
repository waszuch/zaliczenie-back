const db = require('./src/services/db');
const bcrypt = require('bcrypt');

async function initDb() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user'
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                capacity INTEGER NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                room_id INTEGER REFERENCES rooms(id),
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                UNIQUE(room_id, start_time, end_time)
            );
        `);

        console.log('Tabele zostały utworzone.');

        // Dodanie przykładowego admina i salek
        const adminPassword = await bcrypt.hash('admin123', 10);
        await db.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
            ['admin', adminPassword, 'admin']
        );

        await db.query("INSERT INTO rooms (name, capacity) VALUES ('Salka A', 10), ('Salka B', 5), ('Salka C', 20) ON CONFLICT (id) DO NOTHING");

        console.log('Dane początkowe zostały dodane.');

    } catch (err) {
        console.error('Błąd podczas inicjalizacji bazy danych:', err);
    }
}

initDb(); 