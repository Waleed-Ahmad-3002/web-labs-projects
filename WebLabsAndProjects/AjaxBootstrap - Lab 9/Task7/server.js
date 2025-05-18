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
app.post('/api/login', (req, res) => {
    const { email, password } = req.body
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) return res.status(500).send(err)
        if (results.length) {
            res.send({ success: true, user: { id: results[0].id, name: results[0].name, email: results[0].email } })
        } else {
            res.send({ success: false, message: 'Invalid credentials' })
        }
    })
})
app.get('/api/user/:id', (req, res) => {
    const { id } = req.params
    connection.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results[0])
    })
})
app.listen(3000)
