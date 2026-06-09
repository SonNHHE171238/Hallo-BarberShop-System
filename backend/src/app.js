const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoute = require('../routes/authRoute');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
    res.send('Hallo BarberShop API is running');
});

module.exports = app;