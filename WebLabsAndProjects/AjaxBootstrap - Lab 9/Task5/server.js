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
app.get('/api/todos', (req, res) => {
    connection.query('SELECT * FROM tasks', (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results)
    })
})
app.post('/api/todos', (req, res) => {
    const { description } = req.body
    connection.query('INSERT INTO tasks (description) VALUES (?)', [description], (err, result) => {
        if (err) return res.status(500).send(err)
        connection.query('SELECT * FROM tasks WHERE id = ?', [result.insertId], (err, results) => {
            if (err) return res.status(500).send(err)
            res.send(results[0])
        })
    })
})
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params
    const { description, status } = req.body
    connection.query('UPDATE tasks SET description = ?, status = ? WHERE id = ?', [description, status, id], (err) => {
        if (err) return res.status(500).send(err)
        connection.query('SELECT * FROM tasks WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).send(err)
            res.send(results[0])
        })
    })
})
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params
    connection.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send(err)
        res.send({ success: true })
    })
})
app.listen(3000)
