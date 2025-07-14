const db = require('../services/db');
const Room = require('../models/Room');

exports.getAllRooms = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM rooms ORDER BY name');
        const rooms = result.rows.map(r => new Room(r.id, r.name, r.capacity));
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas pobierania salek.' });
    }
};

exports.createRoom = async (req, res) => {
    const { name, capacity } = req.body;
    if (!name || !capacity) {
        return res.status(400).json({ message: 'Nazwa i pojemność salki są wymagane.' });
    }

    try {
        const result = await db.query(
            'INSERT INTO rooms (name, capacity) VALUES ($1, $2) RETURNING *',
            [name, parseInt(capacity)]
        );
        const newRoom = new Room(result.rows[0].id, result.rows[0].name, result.rows[0].capacity);
        res.status(201).json(newRoom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas tworzenia salki.' });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { name, capacity } = req.body;
    if (!name || !capacity) {
        return res.status(400).json({ message: 'Nazwa i pojemność salki są wymagane.' });
    }

    try {
        const result = await db.query(
            'UPDATE rooms SET name = $1, capacity = $2 WHERE id = $3 RETURNING *',
            [name, parseInt(capacity), id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Salka o podanym ID nie istnieje.' });
        }
        const updatedRoom = new Room(result.rows[0].id, result.rows[0].name, result.rows[0].capacity);
        res.json(updatedRoom);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas aktualizacji salki.' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await db.query('DELETE FROM rooms WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Salka o podanym ID nie istnieje.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas usuwania salki.' });
    }
}; 