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

app.get('/api/products', (req, res) => {
    pool.query('SELECT * FROM products', (err, results) => {
        res.json(err ? [] : results);
    });
});

app.get('/api/products/:id', (req, res) => {
    pool.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
        res.json(err || results.length === 0 ? {} : results[0]);
    });
});

app.post('/api/products', (req, res) => {
    const { name, category, price, description } = req.body;
    pool.query('INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)',
        [name, category, price, description], (err) => {
            res.sendStatus(err ? 500 : 201);
        });
});

app.put('/api/products/:id', (req, res) => {
    const { name, category, price, description } = req.body;
    pool.query('UPDATE products SET name = ?, category = ?, price = ?, description = ? WHERE id = ?',
        [name, category, price, description, req.params.id], (err) => {
            res.sendStatus(err ? 500 : 200);
        });
});

app.delete('/api/products/:id', (req, res) => {
    pool.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        res.sendStatus(err ? 500 : 200);
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));