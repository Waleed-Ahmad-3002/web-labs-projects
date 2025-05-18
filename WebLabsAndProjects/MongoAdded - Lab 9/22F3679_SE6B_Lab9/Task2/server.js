const express = require('express');
const mysql = require('mysql');
// For MongoDB Atlas implementation, uncomment these lines:
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors= require("cors");

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '22f3679_WebLab9'
});

// MongoDB Atlas Connection Setup (commented out)
/*
// Replace with your MongoDB Atlas connection string
// Format: mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/productDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    // Additional Atlas connection options
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Database and collection variables
let db;
let productsCollection;

// Connect to MongoDB Atlas
async function connectToMongoAtlas() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Access the database and collection
        db = client.db("productDatabase");
        productsCollection = db.collection("products");

        // Ping the database to confirm connection
        await db.command({ ping: 1 });
        console.log("MongoDB Atlas connection successfully established");
    } catch (err) {
        console.error("Failed to connect to MongoDB Atlas:", err);
        process.exit(1);
    }
}

// Initialize MongoDB Atlas connection
// connectToMongoAtlas().catch(console.dir);

// Handle application termination - close MongoDB connection
// process.on('SIGINT', async () => {
//     await client.close();
//     console.log('MongoDB Atlas connection closed');
//     process.exit(0);
// });
*/

// MySQL Implementation - Get all products
app.get('/api/products', (req, res) => {
    pool.query('SELECT * FROM products', (err, results) => {
        res.json(err ? [] : results);
    });
});

/* MongoDB Atlas Implementation - Get all products
app.get('/api/products', async (req, res) => {
    try {
        // Find all documents in the products collection
        const products = await productsCollection.find({}).toArray();
        res.json(products);
    } catch (err) {
        console.error('Database error:', err);
        res.json([]);
    }
});
*/

// MySQL Implementation - Get product by ID
app.get('/api/products/:id', (req, res) => {
    pool.query('SELECT * FROM products WHERE id = ?', [req.params.id], (err, results) => {
        res.json(err || results.length === 0 ? {} : results[0]);
    });
});

/* MongoDB Atlas Implementation - Get product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(req.params.id)) {
            return res.json({});
        }

        // Find document by ID
        const product = await productsCollection.findOne({
            _id: new ObjectId(req.params.id)
        });

        // Return the product or an empty object if not found
        res.json(product || {});
    } catch (err) {
        console.error('Database error:', err);
        res.json({});
    }
});
*/

// MySQL Implementation - Add a new product
app.post('/api/products', (req, res) => {
    const { name, category, price, description } = req.body;
    pool.query(
        'INSERT INTO products (name, category, price, description) VALUES (?, ?, ?, ?)',
        [name, category, price, description],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to add product' });
            }
            res.status(201).json({
                success: true,
                id: results.insertId,
                message: 'Product added successfully'
            });
        }
    );
});

/* MongoDB Atlas Implementation - Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, category, price, description } = req.body;

        // Validate required fields
        if (!name || !category || !price) {
            return res.status(400).json({
                success: false,
                error: 'Name, category, and price are required fields'
            });
        }

        // Convert price to number if it's a string
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        // Create product document
        const product = {
            name,
            category,
            price: numericPrice,
            description: description || '',
            createdAt: new Date()
        };

        // Insert the product into the collection
        const result = await productsCollection.insertOne(product);

        res.status(201).json({
            success: true,
            id: result.insertedId.toString(),
            message: 'Product added successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to add product'
        });
    }
});
*/

// MySQL Implementation - Update a product
app.put('/api/products/:id', (req, res) => {
    const { name, category, price, description } = req.body;
    const productId = req.params.id;

    // Validate the product ID
    if (!productId || isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    pool.query(
        'UPDATE products SET name = ?, category = ?, price = ?, description = ? WHERE id = ?',
        [name, category, price, description, productId],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to update product' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json({
                success: true,
                message: 'Product updated successfully'
            });
        }
    );
});

/* MongoDB Atlas Implementation - Update a product
app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, category, price, description } = req.body;
        const productId = req.params.id;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        // Convert price to number if it's a string
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        // Create update document
        const updateData = {
            $set: {
                name,
                category,
                price: numericPrice,
                description,
                updatedAt: new Date()
            }
        };

        // Update the product
        const result = await productsCollection.updateOne(
            { _id: new ObjectId(productId) },
            updateData
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
});
*/

// MySQL Implementation - Delete a product
app.delete('/api/products/:id', (req, res) => {
    pool.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        res.sendStatus(err ? 500 : 200);
    });
});

/* MongoDB Atlas Implementation - Delete a product
app.delete('/api/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(productId)) {
            return res.sendStatus(400); // Bad request
        }

        // Delete the product
        const result = await productsCollection.deleteOne({
            _id: new ObjectId(productId)
        });

        // Check if a document was actually deleted
        if (result.deletedCount === 0) {
            return res.sendStatus(404); // Not found
        }

        res.sendStatus(200); // Success
    } catch (err) {
        console.error('Database error:', err);
        res.sendStatus(500); // Server error
    }
});
*/

app.listen(3000, () => console.log('Server running on port 3000'));