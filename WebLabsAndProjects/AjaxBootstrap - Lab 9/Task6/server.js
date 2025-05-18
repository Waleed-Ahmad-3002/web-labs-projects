const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const app = express()
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '22I2647_WebLab9'
})
connection.connect()
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/api/blogs', (req, res) => {
    connection.query('SELECT * FROM blogs ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results)
    })
})
app.get('/api/blogs/:id', (req, res) => {
    const { id } = req.params
    connection.query('SELECT * FROM blogs WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results[0])
    })
})
app.post('/api/blogs', (req, res) => {
    const { title, author, content } = req.body
    connection.query('INSERT INTO blogs (title, author, content) VALUES (?, ?, ?)', [title, author, content], (err, result) => {
        if (err) return res.status(500).send(err)
        connection.query('SELECT * FROM blogs WHERE id = ?', [result.insertId], (err, results) => {
            if (err) return res.status(500).send(err)
            res.send(results[0])
        })
    })
})
app.listen(3000)
