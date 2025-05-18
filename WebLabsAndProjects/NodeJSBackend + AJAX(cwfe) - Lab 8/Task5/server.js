const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "22i2647_weblab8"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

app.get("/api/students/check-email", (req, res) => {
    const { email } = req.query;
    const query = "SELECT * FROM students WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ exists: results.length > 0 });
    });
});

app.post("/api/students/register", (req, res) => {
    const { name, email, password } = req.body;
    
    const query = "INSERT INTO students (name, email, password) VALUES (?, ?, ?)";
    db.query(query, [name, email, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Student registered successfully!" });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
