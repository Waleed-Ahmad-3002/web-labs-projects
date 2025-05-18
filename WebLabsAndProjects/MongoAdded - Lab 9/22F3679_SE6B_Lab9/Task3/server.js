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
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/feedbackSystem?retryWrites=true&w=majority";

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
let feedbackCollection;

// Connect to MongoDB Atlas
async function connectToMongoAtlas() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Access the database and collection
        db = client.db("feedbackSystem");
        feedbackCollection = db.collection("feedback");

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

// MySQL Implementation - Submit feedback
app.post('/api/feedback', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields are required' });
    pool.query('INSERT INTO feedback (name, email, message) VALUES (?, ?, ?)', [name, email, message], (error) => {
        if (error) return res.status(500).json({ error: error.sqlMessage || 'Database error' });
        res.status(201).send();
    });
});

/* MongoDB Atlas Implementation - Submit feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create feedback document with timestamp
        const feedback = {
            name,
            email,
            message,
            createdAt: new Date()
        };

        // Insert the feedback into the collection
        await feedbackCollection.insertOne(feedback);

        // Return success status
        res.status(201).send();
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to submit feedback',
            details: err.message
        });
    }
});
*/

// MySQL Implementation - Get all feedback
app.get('/api/feedback', (req, res) => {
    pool.query('SELECT * FROM feedback', (error, results) => {
        if (error) return res.status(500).json({ error: error.sqlMessage || 'Database error' });
        res.json(results);
    });
});

/* MongoDB Atlas Implementation - Get all feedback
app.get('/api/feedback', async (req, res) => {
    try {
        // Find all feedback documents and sort by creation date (newest first)
        const feedback = await feedbackCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.json(feedback);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to retrieve feedback',
            details: err.message
        });
    }
});
*/

/* Additional MongoDB Atlas endpoints (commented out)

// Get feedback by ID
app.get('/api/feedback/:id', async (req, res) => {
    try {
        const feedbackId = req.params.id;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(feedbackId)) {
            return res.status(400).json({ error: 'Invalid feedback ID' });
        }

        // Find feedback by ID
        const feedback = await feedbackCollection.findOne({
            _id: new ObjectId(feedbackId)
        });

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json(feedback);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve feedback' });
    }
});

// Delete feedback
app.delete('/api/feedback/:id', async (req, res) => {
    try {
        const feedbackId = req.params.id;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(feedbackId)) {
            return res.status(400).json({ error: 'Invalid feedback ID' });
        }

        // Delete the feedback
        const result = await feedbackCollection.deleteOne({
            _id: new ObjectId(feedbackId)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

// Get feedback statistics
app.get('/api/feedback/stats', async (req, res) => {
    try {
        // Get total count of feedback
        const totalCount = await feedbackCollection.countDocuments();

        // Get count of feedback by email domain
        const emailDomainStats = await feedbackCollection.aggregate([
            // Extract email domain
            { $project: {
                domain: { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] }
            }},
            // Group by domain and count
            { $group: {
                _id: "$domain",
                count: { $sum: 1 }
            }},
            // Sort by count descending
            { $sort: { count: -1 } }
        ]).toArray();

        res.json({
            totalCount,
            emailDomainStats
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to retrieve feedback statistics' });
    }
});
*/

app.listen(3000, () => console.log('Server running on port 3000'));