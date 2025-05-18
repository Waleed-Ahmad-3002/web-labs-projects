
var express = require("express");
var mysql = require("mysql");
var app = express();
app.use(express.json())


var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "mystore",
    });

    var server = app.listen(5000, function () {
        console.log("App running on port 5000");
        });
    //checking for connection is build or not
    conn.connect(function (err) {
        if (err) throw err;
        console.log("Connection Sucessful");
        });

        //Task1 Inserting data
            app.post("/insert", (req, res) => {
                const { name, description, price } = req.body; // id is auto-incremented
                var sql = "INSERT INTO records (name, description, price) VALUES (?, ?, ?)";
                conn.query(sql, [name, description, price], function (err, results) {
                    if (err) {
                        console.error("Error inserting data:", err);
                        return res.status(500).send("<h1>Error inserting data</h1>");
                    }
                    res.send("<h1>Data Inserted Successfully.</h1>");
                });
            });
            //  Task2 fetch item by id 
            app.get("/api/items/:id", (req, res) => {
                const itemId = req.params.id;
            
                var sql = "SELECT * FROM records WHERE id = ?";
                conn.query(sql, [itemId], function (err, results) {
                    if (err) {
                        console.error("Error fetching item:", err);
                        return res.status(500).json({ error: "Error fetching item" });
                    }
                    if (results.length === 0) {
                        return res.status(404).json({ error: "Item not found" });
                    }
                    res.json(results[0]);
                });
            });
            // ✅ Task 3: Fetch All Items from MySQL
app.get("/api/items", (req, res) => {
    var sql = "SELECT * FROM records"; // Query to get all items

    conn.query(sql, function (err, results) {
        if (err) {
            console.error("Error fetching items:", err);
            return res.status(500).json({ error: "Error fetching items" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No items found" });
        }
        res.json(results); // Return all items as JSON
    });
});
        // ✅ Task 4: Update an Item's Details
        app.put("/api/items/:id", (req, res) => {
         const itemId = req.params.id; // Get item ID from URL
         const { name, description, price } = req.body; // Extract new values from request body

        if (!name || !description || !price) {
        return res.status(400).json({ error: "All fields (name, description, price) are required." });
         }

        var sql = "UPDATE records SET name = ?, description = ?, price = ? WHERE id = ?";
        conn.query(sql, [name, description, price, itemId], function (err, results) {
        if (err) {
            console.error("Error updating item:", err);
            return res.status(500).json({ error: "Error updating item" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json({ message: "Item updated successfully" });
     });
    });

         // ✅ Task 5: Delete an Item from MySQL
        app.delete("/api/items/:id", (req, res) => {
        const itemId = req.params.id; // Get item ID from URL

        var sql = "DELETE FROM records WHERE id = ?"; // Query to    delete item
         conn.query(sql, [itemId], function (err, results) {
        if (err) {
            console.error("Error deleting item:", err);
            return res.status(500).json({ error: "Error deleting item" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json({ message: "Item deleted successfully" });
    });
    });


          
            