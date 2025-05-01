const express = require('express');
const dotenv = require('dotenv');
const db = require('./db'); // MySQL connection
const userRoutes = require('./routes/userRoutes');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', userRoutes);
// Serve static files from /public and /assets
app.use(express.static(path.join(__dirname, '../public')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Routes
app.get('/', (req, res) => {
    res.send('🎉 Blood Donation Management System Backend is working!');
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});
