const db = require('../services/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nazwa użytkownika i hasło są wymagane.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, role',
            [username, hashedPassword]
        );
        const newUser = new User(result.rows[0].id, result.rows[0].username, null, result.rows[0].role);

        res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie.', user: newUser });
    } catch (error) {
        if (error.code === '23505') { // Unikalny klucz naruszony
            return res.status(409).json({ message: 'Użytkownik o tej nazwie już istnieje.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas rejestracji.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nazwa użytkownika i hasło są wymagane.' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Błędna nazwa użytkownika lub hasło.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Błędna nazwa użytkownika lub hasło.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.jwtSecret,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera podczas logowania.' });
    }
}; 