const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./src/routes/auth');
const roomRoutes = require('./src/routes/room');
const bookingRoutes = require('./src/routes/booking');
const userRoutes = require('./src/routes/user');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('API serwera do rezerwacji salek działa!');
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Serwer uruchomiony na porcie ${PORT}`);
}); 