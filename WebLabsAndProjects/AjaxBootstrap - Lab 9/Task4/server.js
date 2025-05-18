const express = require('express')
const mysql = require('mysql')
const app = express()
app.use(express.json())
app.use(express.static('public'))
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '22I2647_WebLab9'
})
app.get('/api/jobs', (req, res) => {
    pool.query('SELECT * FROM jobs', (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})
app.post('/api/apply', (req, res) => {
    const { job_id, name, email, resume_link } = req.body
    if (!job_id || !name || !email || !resume_link) return res.status(400).json({ error: 'All fields required' })
    pool.query('INSERT INTO applicants (job_id, name, email, resume_link) VALUES (?, ?, ?, ?)', [job_id, name, email, resume_link], err => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).send()
    })
})
app.get('/api/applicants/:jobId', (req, res) => {
    pool.query('SELECT * FROM applicants WHERE job_id = ?', [req.params.jobId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})
app.listen(3000, () => console.log('Server running on port 3000'))
