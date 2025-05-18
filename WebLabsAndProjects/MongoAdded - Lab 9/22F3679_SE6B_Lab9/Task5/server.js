const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
// For MongoDB Atlas implementation, uncomment these lines:
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const app = express()
const cors= require("cors");

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '22f3679_WebLab9'
})
connection.connect()
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(cors());

// MongoDB Atlas Connection Setup (commented out)
/*
// Replace with your MongoDB Atlas connection string
// Format: mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/todoApp?retryWrites=true&w=majority";

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
let tasksCollection;

// Connect to MongoDB Atlas
async function connectToMongoAtlas() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Access the database and collection
        db = client.db("todoApp");
        tasksCollection = db.collection("tasks");

        // Create indexes for better query performance
        await tasksCollection.createIndex({ status: 1 });

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
// MySQL Implementation - Get all todos
app.get('/api/todos', (req, res) => {
    connection.query('SELECT * FROM tasks', (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results)
    })
})

/* MongoDB Atlas Implementation - Get all todos
app.get('/api/todos', async (req, res) => {
    try {
        // Find all tasks and sort by creation date (newest first)
        const tasks = await tasksCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.send(tasks);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
})
*/
// MySQL Implementation - Create a new todo
app.post('/api/todos', (req, res) => {
    const { description } = req.body
    connection.query('INSERT INTO tasks (description) VALUES (?)', [description], (err, result) => {
        if (err) return res.status(500).send(err)
        connection.query('SELECT * FROM tasks WHERE id = ?', [result.insertId], (err, results) => {
            if (err) return res.status(500).send(err)
            res.send(results[0])
        })
    })
})

/* MongoDB Atlas Implementation - Create a new todo
app.post('/api/todos', async (req, res) => {
    try {
        const { description } = req.body

        // Validate required fields
        if (!description) {
            return res.status(400).send({ error: 'Description is required' });
        }

        // Create task document with timestamp and default status
        const task = {
            description,
            status: 'pending', // Default status
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert the task into the collection
        const result = await tasksCollection.insertOne(task);

        // Get the inserted task with its ID
        const insertedTask = await tasksCollection.findOne({ _id: result.insertedId });

        // Return the newly created task
        res.status(201).send(insertedTask);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
})
*/
// MySQL Implementation - Update a todo
app.put('/api/todos/:id', (req, res) => {
    const { id } = req.params
    const { description, status } = req.body
    connection.query('UPDATE tasks SET description = ?, status = ? WHERE id = ?', [description, status, id], (err) => {
        if (err) return res.status(500).send(err)
        connection.query('SELECT * FROM tasks WHERE id = ?', [id], (err, results) => {
            if (err) return res.status(500).send(err)
            res.send(results[0])
        })
    })
})

/* MongoDB Atlas Implementation - Update a todo
app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, status } = req.body;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid task ID' });
        }

        // Validate status if provided
        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).send({ error: 'Invalid status value' });
        }

        // Create update document
        const updateData = {
            $set: {
                updatedAt: new Date()
            }
        };

        // Only update fields that are provided
        if (description !== undefined) {
            updateData.$set.description = description;
        }

        if (status !== undefined) {
            updateData.$set.status = status;
        }

        // Update the task
        const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Task not found' });
        }

        // Get the updated task
        const updatedTask = await tasksCollection.findOne({ _id: new ObjectId(id) });

        res.send(updatedTask);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
})
*/
// MySQL Implementation - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params
    connection.query('DELETE FROM tasks WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send(err)
        res.send({ success: true })
    })
})

/* MongoDB Atlas Implementation - Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid task ID' });
        }

        // Delete the task
        const result = await tasksCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'Task not found' });
        }

        res.send({ success: true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
})
*/

/* Additional MongoDB Atlas endpoints (commented out)

// Get todos by status
app.get('/api/todos/status/:status', async (req, res) => {
    try {
        const { status } = req.params;

        // Validate status
        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).send({ error: 'Invalid status value' });
        }

        // Find tasks by status
        const tasks = await tasksCollection
            .find({ status })
            .sort({ createdAt: -1 })
            .toArray();

        res.send(tasks);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});

// Mark all todos as completed
app.patch('/api/todos/complete-all', async (req, res) => {
    try {
        // Update all pending tasks to completed
        const result = await tasksCollection.updateMany(
            { status: { $ne: 'completed' } },
            {
                $set: {
                    status: 'completed',
                    updatedAt: new Date()
                }
            }
        );

        res.send({
            success: true,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});

// Get todo statistics
app.get('/api/todos/stats', async (req, res) => {
    try {
        // Get count of tasks by status
        const statusStats = await tasksCollection.aggregate([
            { $group: {
                _id: "$status",
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]).toArray();

        // Get total count
        const totalCount = await tasksCollection.countDocuments();

        // Format the response
        const stats = {
            total: totalCount,
            byStatus: {}
        };

        // Convert array to object for easier client-side use
        statusStats.forEach(stat => {
            stats.byStatus[stat._id || 'undefined'] = stat.count;
        });

        res.send(stats);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});
*/

app.listen(3000, () => console.log('Server running on port 3000'));
