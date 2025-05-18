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

app.get('/api/students/check-email/:email', (req, res) => {
    pool.query('SELECT 1 FROM students WHERE email = ?', [req.params.email], (err, results) => {
        res.json({ available: !err && results.length === 0 });
    });
});

app.post('/api/students/register', (req, res) => {
    const { name, email, password, department } = req.body;
    pool.query('INSERT INTO students (name, email, password, department) VALUES (?, ?, ?, ?)',
        [name, email, password, department], (err) => {
            if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
            res.json({ success: !err });
        });
});

app.listen(3000, () => console.log('Server running on port 3000'));