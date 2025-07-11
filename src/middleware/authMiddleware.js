const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../services/db');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, config.jwtSecret);

            const result = await db.query('SELECT id, username, role FROM users WHERE id = $1', [decoded.id]);
            req.user = result.rows[0];
            
            if (!req.user) {
                 return res.status(401).json({ message: 'Nieautoryzowany, użytkownik nie istnieje' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Nieautoryzowany, token jest nieprawidłowy' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Nieautoryzowany, brak tokenu' });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Brak uprawnień administratora' });
    }
}; 