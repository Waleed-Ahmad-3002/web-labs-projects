const express = require('express')
const mysql = require('mysql')
// For MongoDB Atlas implementation, uncomment these lines:
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const app = express()
const cors= require("cors");
app.use(express.json())
app.use(express.static('public'))
app.use(cors());

// MySQL Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '22f3679_WebLab9'
})

// MongoDB Atlas Connection Setup (commented out)
/*
// Replace with your MongoDB Atlas connection string
// Format: mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
const uri = "mongodb+srv://username:password@cluster0.mongodb.net/jobPortal?retryWrites=true&w=majority";

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
let jobsCollection;
let applicantsCollection;

// Connect to MongoDB Atlas
async function connectToMongoAtlas() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");

        // Access the database and collections
        db = client.db("jobPortal");
        jobsCollection = db.collection("jobs");
        applicantsCollection = db.collection("applicants");

        // Create indexes for better query performance
        await applicantsCollection.createIndex({ job_id: 1 });
        await applicantsCollection.createIndex({ email: 1 });

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
// MySQL Implementation - Get all jobs
app.get('/api/jobs', (req, res) => {
    pool.query('SELECT * FROM jobs', (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})

/* MongoDB Atlas Implementation - Get all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        // Find all jobs and sort by posting date (newest first)
        const jobs = await jobsCollection
            .find({})
            .sort({ postedDate: -1 })
            .toArray();

        res.json(jobs);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
})
*/
// MySQL Implementation - Submit job application
app.post('/api/apply', (req, res) => {
    const { job_id, name, email, resume_link } = req.body
    if (!job_id || !name || !email || !resume_link) return res.status(400).json({ error: 'All fields required' })
    pool.query('INSERT INTO applicants (job_id, name, email, resume_link) VALUES (?, ?, ?, ?)', [job_id, name, email, resume_link], err => {
        if (err) return res.status(500).json({ error: err.message })
        res.status(201).send()
    })
})

/* MongoDB Atlas Implementation - Submit job application
app.post('/api/apply', async (req, res) => {
    try {
        const { job_id, name, email, resume_link } = req.body

        // Validate required fields
        if (!job_id || !name || !email || !resume_link) {
            return res.status(400).json({ error: 'All fields required' })
        }

        // Check if job exists (optional validation)
        // const job = await jobsCollection.findOne({
        //     _id: new ObjectId(job_id)
        // });
        // if (!job) {
        //     return res.status(404).json({ error: 'Job not found' });
        // }

        // Check if applicant already applied for this job
        const existingApplication = await applicantsCollection.findOne({
            job_id,
            email
        });

        if (existingApplication) {
            return res.status(400).json({
                error: 'You have already applied for this job'
            });
        }

        // Create application document with timestamp
        const application = {
            job_id,
            name,
            email,
            resume_link,
            applied_at: new Date(),
            status: 'pending' // Additional field for application status
        };

        // Insert the application into the collection
        await applicantsCollection.insertOne(application);

        // Return success status
        res.status(201).send();
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
})
*/
// MySQL Implementation - Get applicants by job ID
app.get('/api/applicants/:jobId', (req, res) => {
    pool.query('SELECT * FROM applicants WHERE job_id = ?', [req.params.jobId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message })
        res.json(results)
    })
})

/* MongoDB Atlas Implementation - Get applicants by job ID
app.get('/api/applicants/:jobId', async (req, res) => {
    try {
        const jobId = req.params.jobId;

        // Find all applicants for the specified job
        const applicants = await applicantsCollection
            .find({ job_id: jobId })
            .sort({ applied_at: -1 }) // Sort by application date (newest first)
            .toArray();

        res.json(applicants);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
})
*/

/* Additional MongoDB Atlas endpoints (commented out)

// Get applicant details
app.get('/api/applicants/detail/:id', async (req, res) => {
    try {
        const applicantId = req.params.id;

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(applicantId)) {
            return res.status(400).json({ error: 'Invalid applicant ID' });
        }

        // Find applicant by ID
        const applicant = await applicantsCollection.findOne({
            _id: new ObjectId(applicantId)
        });

        if (!applicant) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        res.json(applicant);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update application status
app.patch('/api/applicants/:id/status', async (req, res) => {
    try {
        const applicantId = req.params.id;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'reviewed', 'interviewed', 'rejected', 'hired'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Validate that the ID is a valid MongoDB ObjectId
        if (!ObjectId.isValid(applicantId)) {
            return res.status(400).json({ error: 'Invalid applicant ID' });
        }

        // Update the application status
        const result = await applicantsCollection.updateOne(
            { _id: new ObjectId(applicantId) },
            {
                $set: {
                    status,
                    updated_at: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Applicant not found' });
        }

        res.json({ message: 'Application status updated successfully' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get application statistics
app.get('/api/stats', async (req, res) => {
    try {
        // Get total counts
        const totalJobs = await jobsCollection.countDocuments();
        const totalApplicants = await applicantsCollection.countDocuments();

        // Get applicants per job
        const applicantsPerJob = await applicantsCollection.aggregate([
            { $group: {
                _id: "$job_id",
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Get application status distribution
        const statusDistribution = await applicantsCollection.aggregate([
            { $group: {
                _id: "$status",
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } }
        ]).toArray();

        res.json({
            totalJobs,
            totalApplicants,
            applicantsPerJob,
            statusDistribution
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});
*/

app.listen(3000, () => console.log('Server running on port 3000'))
