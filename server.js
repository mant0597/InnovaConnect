const mysql = require('mysql');
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));  // Serve static files from the 'public' folder

// MySQL Connection Setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'startup_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Developer Adds Logs
app.post('/logs', (req, res) => {
    const { title, description, progress, createdBy, projectId } = req.body;
    const sql = 'INSERT INTO dev_logs (title, description, progress, created_by, project_id) VALUES (?, ?, ?, ?, ?)';
    
    db.query(sql, [title, description, progress, createdBy, projectId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error adding log', error: err });
        }
        res.status(201).json({ message: 'Log added successfully!' });
    });
});

// Developer: Get All Logs
app.get('/logs', (req, res) => {
    const sql = 'SELECT * FROM dev_logs';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving logs', error: err });
        }
        res.json(results);
    });
});

// Investor: Subscribe to Project
app.post('/subscribe', (req, res) => {
    const { investorId, projectId } = req.body;
    const sql = 'INSERT INTO subscriptions (investor_id, project_id) VALUES (?, ?)';
    
    db.query(sql, [investorId, projectId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error subscribing', error: err });
        }
        res.status(201).json({ message: 'Subscribed successfully!' });
    });
});

// Investor: Get Logs for Subscribed Projects
app.get('/investor/logs/:investorId', (req, res) => {
    const { investorId } = req.params;
    const sql = `
        SELECT dl.* FROM dev_logs dl
        JOIN subscriptions s ON s.project_id = dl.project_id
        WHERE s.investor_id = ?
    `;
    
    db.query(sql, [investorId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving logs', error: err });
        }
        res.json(results);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
