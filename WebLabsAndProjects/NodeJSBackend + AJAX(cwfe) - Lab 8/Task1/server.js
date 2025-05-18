const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

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

app.post("/api/products", (req, res) => {
    const { productName, category, price } = req.body;

    if (!productName || !category || !price) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = "INSERT INTO products (product_name, category, price) VALUES (?, ?, ?)";
    db.query(query, [productName, category, price], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Product added successfully!" });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
