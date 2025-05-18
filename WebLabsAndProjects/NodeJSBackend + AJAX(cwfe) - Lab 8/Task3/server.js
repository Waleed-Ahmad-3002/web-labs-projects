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

app.get("/api/products", (req, res) => {
    const query = "SELECT * FROM products";
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(results);
    });
});

app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { product_name, category, price } = req.body;

    const query = "UPDATE products SET product_name=?, category=?, price=? WHERE id=?";
    db.query(query, [product_name, category, price, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Product updated successfully!" });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
