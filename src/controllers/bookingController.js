const db = require('../services/db');
const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    const { roomId, startTime, endTime } = req.body;
    const userId = req.user.id;

    if (!roomId || !startTime || !endTime) {
        return res.status(400).json({ message: 'ID salki oraz czas rozpoczęcia i zakończenia są wymagane.' });
    }

    // Walidacja dat
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Nieprawidłowy format daty.' });
    }

    if (start >= end) {
        return res.status(400).json({ message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia.' });
    }

    if (start < now) {
        return res.status(400).json({ message: 'Nie można rezerwować sal w przeszłości.' });
    }

    try {
        // Sprawdzenie, czy termin nie jest zajęty
        const existingBooking = await db.query(
            `SELECT * FROM bookings 
             WHERE room_id = $1 AND (
                (start_time, end_time) OVERLAPS ($2, $3)
             )`,
            [roomId, startTime, endTime]
        );

        if (existingBooking.rows.length > 0) {
            return res.status(409).json({ message: 'Salka jest już zarezerwowana w tym terminie.' });
        }

        const result = await db.query(
            'INSERT INTO bookings (user_id, room_id, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, roomId, startTime, endTime]
        );
        const newBooking = new Booking(result.rows[0].id, result.rows[0].user_id, result.rows[0].room_id, result.rows[0].start_time, result.rows[0].end_time);
        res.status(201).json(newBooking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas tworzenia rezerwacji.' });
    }
};

exports.getBookings = async (req, res) => {
    const { userId } = req.query; // Nowy parametr filtra użytkownika
    
    try {
        let result;
        if (req.user.role === 'admin') {
            // Admin widzi wszystko lub filtruje po konkretnym użytkowniku
            if (userId && userId !== 'all') {
                result = await db.query(`
                    SELECT b.id, b.user_id, b.room_id, b.start_time, b.end_time, u.username, r.name as room_name 
                    FROM bookings b
                    JOIN users u ON b.user_id = u.id
                    JOIN rooms r ON b.room_id = r.id
                    WHERE b.user_id = $1
                    ORDER BY b.start_time DESC
                `, [userId]);
            } else {
                // Wszystkich użytkowników
                result = await db.query(`
                    SELECT b.id, b.user_id, b.room_id, b.start_time, b.end_time, u.username, r.name as room_name 
                    FROM bookings b
                    JOIN users u ON b.user_id = u.id
                    JOIN rooms r ON b.room_id = r.id
                    ORDER BY b.start_time DESC
                `);
            }
        } else {
            // Zwykły user widzi tylko swoje
            result = await db.query(`
                SELECT b.id, b.user_id, b.room_id, b.start_time, b.end_time, r.name as room_name 
                FROM bookings b
                JOIN rooms r ON b.room_id = r.id
                WHERE b.user_id = $1
                ORDER BY b.start_time DESC
            `, [req.user.id]);
        }
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania rezerwacji.' });
    }
};

exports.updateBooking = async (req, res) => {
    const { id } = req.params;
    const { roomId, startTime, endTime } = req.body;

    if (!roomId || !startTime || !endTime) {
        return res.status(400).json({ message: 'Wszystkie pola są wymagane do aktualizacji.' });
    }

    // Walidacja dat
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Nieprawidłowy format daty.' });
    }

    if (start >= end) {
        return res.status(400).json({ message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia.' });
    }

    if (start < now) {
        return res.status(400).json({ message: 'Nie można przebookować na termin w przeszłości.' });
    }

    try {
        // Sprawdź czy rezerwacja istnieje i czy użytkownik ma prawo ją edytować
        const bookingCheck = await db.query(
            'SELECT * FROM bookings WHERE id = $1',
            [id]
        );

        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Rezerwacja nie została znaleziona.' });
        }

        const booking = bookingCheck.rows[0];
        
        // Sprawdź czy użytkownik jest właścicielem rezerwacji lub administratorem
        if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Nie masz uprawnień do edytowania tej rezerwacji.' });
        }

        // Sprawdzamy kolizje, wykluczając edytowaną rezerwację
        const existingBooking = await db.query(
            `SELECT * FROM bookings 
             WHERE room_id = $1 AND id != $2 AND ((start_time, end_time) OVERLAPS ($3, $4))`,
            [roomId, id, startTime, endTime]
        );

        if (existingBooking.rows.length > 0) {
            return res.status(409).json({ message: 'Salka jest już zarezerwowana w tym terminie.' });
        }

        const result = await db.query(
            'UPDATE bookings SET room_id = $1, start_time = $2, end_time = $3 WHERE id = $4 RETURNING *',
            [roomId, startTime, endTime, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas aktualizacji rezerwacji.' });
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM bookings WHERE id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas usuwania rezerwacji.' });
    }
};

exports.getCalendarBookings = async (req, res) => {
    const { startDate, endDate, userId } = req.query; // Dodano userId
    
    try {
        let result;
        
        if (req.user.role === 'admin') {
            // Admin widzi wszystkie rezerwacje z pełnymi danymi lub filtruje po użytkowniku
            if (userId && userId !== 'all') {
                result = await db.query(`
                    SELECT 
                        b.id, 
                        b.user_id, 
                        b.room_id, 
                        b.start_time, 
                        b.end_time, 
                        u.username, 
                        r.name as room_name,
                        r.capacity
                    FROM bookings b
                    JOIN users u ON b.user_id = u.id
                    JOIN rooms r ON b.room_id = r.id
                    WHERE b.user_id = $3
                      AND ($1::date IS NULL OR DATE(b.start_time) >= $1::date)
                      AND ($2::date IS NULL OR DATE(b.end_time) <= $2::date)
                    ORDER BY b.start_time
                `, [startDate || null, endDate || null, userId]);
            } else {
                // Wszystkich użytkowników
                result = await db.query(`
                    SELECT 
                        b.id, 
                        b.user_id, 
                        b.room_id, 
                        b.start_time, 
                        b.end_time, 
                        u.username, 
                        r.name as room_name,
                        r.capacity
                    FROM bookings b
                    JOIN users u ON b.user_id = u.id
                    JOIN rooms r ON b.room_id = r.id
                    WHERE ($1::date IS NULL OR DATE(b.start_time) >= $1::date)
                      AND ($2::date IS NULL OR DATE(b.end_time) <= $2::date)
                    ORDER BY b.start_time
                `, [startDate || null, endDate || null]);
            }
        } else {
            // Zwykły user widzi tylko informacje o tym które sale są zajęte (bez danych osobowych)
            result = await db.query(`
                SELECT 
                    b.id,
                    b.room_id, 
                    b.start_time, 
                    b.end_time, 
                    r.name as room_name,
                    r.capacity,
                    CASE 
                        WHEN b.user_id = $3 THEN u.username 
                        ELSE 'Zarezerwowane' 
                    END as username,
                    CASE 
                        WHEN b.user_id = $3 THEN b.user_id 
                        ELSE NULL 
                    END as user_id
                FROM bookings b
                JOIN users u ON b.user_id = u.id
                JOIN rooms r ON b.room_id = r.id
                WHERE ($1::date IS NULL OR DATE(b.start_time) >= $1::date)
                  AND ($2::date IS NULL OR DATE(b.end_time) <= $2::date)
                ORDER BY b.start_time
            `, [startDate || null, endDate || null, req.user.id]);
        }
        
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania rezerwacji kalendarza.' });
    }
}; 