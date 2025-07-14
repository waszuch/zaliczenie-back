const db = require('../services/db');

exports.getUsers = async (req, res) => {
    // Tylko admin może pobierać listę użytkowników
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Brak uprawnień' });
    }

    try {
        const result = await db.query(`
            SELECT 
                id, 
                username, 
                role,
                (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) as bookings_count
            FROM users 
            ORDER BY username ASC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Błąd podczas pobierania użytkowników:', error);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania użytkowników.' });
    }
}; 