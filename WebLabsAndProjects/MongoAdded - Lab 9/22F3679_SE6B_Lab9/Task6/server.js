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
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/blogSystem?retryWrites=true&w=majority";

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
let blogsCollection;

// Connect to MongoDB Atlas
async function connectToMongoAtlas() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Access the database and collection
        db = client.db("blogSystem");
        blogsCollection = db.collection("blogs");

        // Create indexes for better query performance
        await blogsCollection.createIndex({ author: 1 });
        await blogsCollection.createIndex({ created_at: -1 });

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
// MySQL Implementation - Get all blogs
app.get('/api/blogs', (req, res) => {
    connection.query('SELECT * FROM blogs ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results)
    })
})

/* MongoDB Atlas Implementation - Get all blogs
app.get('/api/blogs', async (req, res) => {
    try {
        // Find all blogs and sort by creation date (newest first)
        const blogs = await blogsCollection
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        res.send(blogs);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
})
*/
// MySQL Implementation - Get blog by ID
app.get('/api/blogs/:id', (req, res) => {
    const { id } = req.params
    connection.query('SELECT * FROM blogs WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err)
        res.send(results[0])
    })
})

/* MongoDB Atlas Implementation - Get blog by ID
app.get('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid blog ID' });
        }

        // Find blog by ID
        const blog = await blogsCollection.findOne({
            _id: new ObjectId(id)
        });

        if (!blog) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        res.send(blog);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
})
*/
// MySQL Implementation - Create a new blog
app.post('/api/blogs', (req, res) => {
    const { title, author, content } = req.body
    connection.query('INSERT INTO blogs (title, author, content) VALUES (?, ?, ?)', [title, author, content], (err, result) => {
        if (err) return res.status(500).send(err)
        connection.query('SELECT * FROM blogs WHERE id = ?', [result.insertId], (err, results) => {
            if (err) return res.status(500).send(err)
            res.send(results[0])
        })
    })
})

/* MongoDB Atlas Implementation - Create a new blog
app.post('/api/blogs', async (req, res) => {
    try {
        const { title, author, content } = req.body;

        // Validate required fields
        if (!title || !author || !content) {
            return res.status(400).send({ error: 'Title, author, and content are required' });
        }

        // Create blog document with timestamp
        const blog = {
            title,
            author,
            content,
            created_at: new Date(),
            updated_at: new Date(),
            likes: 0,
            comments: []
        };

        // Insert the blog into the collection
        const result = await blogsCollection.insertOne(blog);

        // Get the inserted blog with its ID
        const insertedBlog = await blogsCollection.findOne({ _id: result.insertedId });

        // Return the newly created blog
        res.status(201).send(insertedBlog);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
})
*/

/* Additional MongoDB Atlas endpoints (commented out)

// Update a blog
app.put('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, content } = req.body;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid blog ID' });
        }

        // Create update document
        const updateData = {
            $set: {
                updated_at: new Date()
            }
        };

        // Only update fields that are provided
        if (title !== undefined) {
            updateData.$set.title = title;
        }

        if (author !== undefined) {
            updateData.$set.author = author;
        }

        if (content !== undefined) {
            updateData.$set.content = content;
        }

        // Update the blog
        const result = await blogsCollection.updateOne(
            { _id: new ObjectId(id) },
            updateData
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        // Get the updated blog
        const updatedBlog = await blogsCollection.findOne({ _id: new ObjectId(id) });

        res.send(updatedBlog);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});

// Delete a blog
app.delete('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid blog ID' });
        }

        // Delete the blog
        const result = await blogsCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        res.send({ success: true });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});

// Like a blog
app.post('/api/blogs/:id/like', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid blog ID' });
        }

        // Increment the likes count
        const result = await blogsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $inc: { likes: 1 } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        // Get the updated blog
        const updatedBlog = await blogsCollection.findOne({ _id: new ObjectId(id) });

        res.send(updatedBlog);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});

// Add a comment to a blog
app.post('/api/blogs/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { author, text } = req.body;

        // Validate required fields
        if (!author || !text) {
            return res.status(400).send({ error: 'Author and text are required for comments' });
        }

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid blog ID' });
        }

        // Create comment object
        const comment = {
            id: new ObjectId().toString(), // Generate a unique ID for the comment
            author,
            text,
            created_at: new Date()
        };

        // Add the comment to the blog's comments array
        const result = await blogsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $push: { comments: comment },
                $set: { updated_at: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        // Get the updated blog
        const updatedBlog = await blogsCollection.findOne({ _id: new ObjectId(id) });

        res.status(201).send(updatedBlog);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});

// Get blogs by author
app.get('/api/blogs/author/:author', async (req, res) => {
    try {
        const { author } = req.params;

        // Find blogs by author and sort by creation date (newest first)
        const blogs = await blogsCollection
            .find({ author })
            .sort({ created_at: -1 })
            .toArray();

        res.send(blogs);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});

// Get blog statistics
app.get('/api/stats', async (req, res) => {
    try {
        // Get total count of blogs
        const totalBlogs = await blogsCollection.countDocuments();

        // Get blogs per author
        const blogsPerAuthor = await blogsCollection.aggregate([
            { $group: {
                _id: "$author",
                count: { $sum: 1 },
                totalLikes: { $sum: "$likes" }
            }},
            { $sort: { count: -1 } }
        ]).toArray();

        // Get most liked blogs
        const mostLikedBlogs = await blogsCollection
            .find({})
            .sort({ likes: -1 })
            .limit(5)
            .project({ title: 1, author: 1, likes: 1 })
            .toArray();

        res.send({
            totalBlogs,
            blogsPerAuthor,
            mostLikedBlogs
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send(err);
    }
});
*/

app.listen(3000, () => console.log('Server running on port 3000'));
