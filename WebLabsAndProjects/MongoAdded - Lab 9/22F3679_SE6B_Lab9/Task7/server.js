const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
// For MongoDB Atlas implementation, uncomment these lines:
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
// const bcrypt = require('bcrypt') // For secure password handling
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
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/authSystem?retryWrites=true&w=majority";

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
let usersCollection;

// Connect to MongoDB Atlas
async function connectToMongoAtlas() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Access the database and collection
        db = client.db("authSystem");
        usersCollection = db.collection("users");

        // Create unique index on email to prevent duplicates
        await usersCollection.createIndex({ email: 1 }, { unique: true });

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
// MySQL Implementation - User login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
        if (err) return res.status(500).send(err)
        if (results.length) {
            res.send({ success: true, user: { id: results[0].id, name: results[0].name, email: results[0].email } })
        } else {
            res.send({ success: false, message: 'Invalid credentials' })
        }
    })
})

/* MongoDB Atlas Implementation - User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.send({ success: false, message: 'Email and password are required' });
        }

        // Find user by email
        const user = await usersCollection.findOne({ email });

        // If user not found or password doesn't match
        if (!user) {
            return res.send({ success: false, message: 'Invalid credentials' });
        }

        // For plain text password comparison (not recommended for production)
        if (user.password !== password) {
            return res.send({ success: false, message: 'Invalid credentials' });
        }

        // For bcrypt password comparison (recommended for production)
        // Uncomment this and comment out the plain text comparison above
        // const passwordMatch = await bcrypt.compare(password, user.password);
        // if (!passwordMatch) {
        //     return res.send({ success: false, message: 'Invalid credentials' });
        // }

        // Return user info without sensitive data
        res.send({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ success: false, message: 'Server error' });
    }
})
*/
// MySQL Implementation - Get user by ID
app.get('/api/user/:id', (req, res) => {
    const { id } = req.params
    connection.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results[0])
    })
})

/* MongoDB Atlas Implementation - Get user by ID
app.get('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }

        // Find user by ID and exclude password field
        const user = await usersCollection.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } } // Exclude password from results
        );

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send(user);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({ error: 'Server error' });
    }
})
*/

/* Additional MongoDB Atlas endpoints (commented out)

// Register a new user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).send({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        // Check if email already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: 'Email already in use'
            });
        }

        // For plain text password storage (not recommended for production)
        let userPassword = password;

        // For bcrypt password hashing (recommended for production)
        // Uncomment this and comment out the plain text storage above
        // const salt = await bcrypt.genSalt(10);
        // const userPassword = await bcrypt.hash(password, salt);

        // Create user document
        const user = {
            name,
            email,
            password: userPassword,
            created_at: new Date(),
            updated_at: new Date(),
            last_login: null
        };

        // Insert the user into the collection
        const result = await usersCollection.insertOne(user);

        // Return success without sending back the password
        res.status(201).send({
            success: true,
            user: {
                id: result.insertedId.toString(),
                name,
                email
            }
        });
    } catch (err) {
        console.error('Database error:', err);

        // Check for duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
            return res.status(400).send({
                success: false,
                message: 'Email already in use'
            });
        }

        res.status(500).send({
            success: false,
            message: 'Server error'
        });
    }
});

// Update user profile
app.put('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid user ID' });
        }

        // Create update document
        const updateData = {
            $set: {
                updated_at: new Date()
            }
        };

        // Only update fields that are provided
        if (name !== undefined) {
            updateData.$set.name = name;
        }

        if (email !== undefined) {
            updateData.$set.email = email;
        }

        // Update the user
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Get the updated user without password
        const updatedUser = await usersCollection.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );

        res.send(updatedUser);
    } catch (err) {
        console.error('Database error:', err);

        // Check for duplicate key error (MongoDB error code 11000)
        if (err.code === 11000) {
            return res.status(400).send({ error: 'Email already in use' });
        }

        res.status(500).send({ error: 'Server error' });
    }
});

// Change password
app.post('/api/user/:id/change-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).send({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Find user by ID
        const user = await usersCollection.findOne({ _id: new ObjectId(id) });

        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        // For plain text password comparison (not recommended for production)
        if (user.password !== currentPassword) {
            return res.status(400).send({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // For bcrypt password comparison (recommended for production)
        // Uncomment this and comment out the plain text comparison above
        // const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        // if (!passwordMatch) {
        //     return res.status(400).send({
        //         success: false,
        //         message: 'Current password is incorrect'
        //     });
        // }

        // For plain text password storage (not recommended for production)
        let userPassword = newPassword;

        // For bcrypt password hashing (recommended for production)
        // Uncomment this and comment out the plain text storage above
        // const salt = await bcrypt.genSalt(10);
        // const userPassword = await bcrypt.hash(newPassword, salt);

        // Update the password
        await usersCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    password: userPassword,
                    updated_at: new Date()
                }
            }
        );

        res.send({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send({
            success: false,
            message: 'Server error'
        });
    }
});
*/

app.listen(3000, () => console.log('Server running on port 3000'));
