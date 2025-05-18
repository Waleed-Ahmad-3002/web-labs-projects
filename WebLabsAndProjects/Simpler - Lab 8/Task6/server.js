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
    database: "simpler_weblab8"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM students WHERE email = ? AND password = ?";

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({ message: "Login successful" });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
