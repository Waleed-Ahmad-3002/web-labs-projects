const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '22I2647_WebLab9'
});

app.post('/api/feedback', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required' });
    pool.query('INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)', [name, email, message], (error) => {
        if (error) return res.status(500).json({ error: error.sqlMessage || 'Database error' });
        res.status(201).send();
    });
});

app.get('/api/feedback', (req, res) => {
    pool.query('SELECT * FROM feedback', (error, results) => {
        if (error) return res.status(500).json({ error: error.sqlMessage || 'Database error' });
        res.json(results);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));