const express = require('express');
const mysql = require('mysql');
// For MongoDB Atlas implementation, uncomment these lines:
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require("cors");

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
// Format: mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/studentRegistration?retryWrites=true&w=majority";

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
let studentsCollection;

// Connect to MongoDB Atlas
async function connectToMongoAtlas() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Access the database and collection
        db = client.db("studentRegistration");
        studentsCollection = db.collection("students");

        // Create a unique index on email field to prevent duplicates
        await studentsCollection.createIndex({ email: 1 }, { unique: true });

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

// MySQL Implementation
app.get('/api/students/check-email/:email', (req, res) => {
    pool.query('SELECT 1 FROM students WHERE email = ?', [req.params.email], (err, results) => {
        res.json({ available: !err && results.length === 0 });
    });
});

app.post('/api/students/register', (req, res) => {
    const { name, email, password, department } = req.body;
    pool.query('INSERT INTO students (name, email, password, department) VALUES (?, ?, ?, ?)',
        [name, email, password, department], (err) => {
            if (err && err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
            res.json({ success: !err });
        });
});

// MongoDB Atlas Implementation (commented out)
/*
// Check if email exists
app.get('/api/students/check-email/:email', async (req, res) => {
    try {
        const email = req.params.email;
        // Use the studentsCollection to find a document with the given email
        const existingUser = await studentsCollection.findOne({ email: email });
        // Return available: true if no user found with this email
        res.json({ available: !existingUser });
    } catch (err) {
        console.error("Error checking email:", err);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// Register a new student
app.post('/api/students/register', async (req, res) => {
    try {
        const { name, email, password, department } = req.body;

        // Validate required fields
        if (!name || !email || !password || !department) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }

        // Insert new student document
        // The unique index on email will automatically prevent duplicates
        const result = await studentsCollection.insertOne({
            name,
            email,
            password, // Note: In production, password should be hashed
            department,
            createdAt: new Date()
        });

        res.json({
            success: true,
            userId: result.insertedId.toString()
        });
    } catch (err) {
        console.error("Error registering student:", err);

        // Check for duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            error: "Server error",
            details: err.message
        });
    }
});

// Additional MongoDB route example - Get all students
// app.get('/api/students', async (req, res) => {
//     try {
//         const students = await studentsCollection.find({})
//             .project({ password: 0 }) // Exclude passwords from results
//             .toArray();
//         res.json(students);
//     } catch (err) {
//         console.error("Error fetching students:", err);
//         res.status(500).json({ error: "Server error" });
//     }
// });
*/

app.listen(3000, () => console.log('Server running on port 3000'));