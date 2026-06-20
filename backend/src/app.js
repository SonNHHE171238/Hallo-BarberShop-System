const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoute = require('../routes/auth.route');
const bookingRoute = require('../routes/booking.route');
const errorHandler = require('../middlewares/error.middleware');

const app = express();

app.use(cors({
    origin: (process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:3001,http://localhost:5173').split(','),
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoute);
app.use('/api/bookings', bookingRoute);

app.get('/', (req, res) => {
    res.send('Hallo BarberShop API is running');
});

// Error Handling Middleware (phải nằm cuối cùng)
app.use(errorHandler);

module.exports = app;