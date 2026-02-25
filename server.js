import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS to allow requests from the Vite frontend
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

/**
 * MySQL Connection Pool Configuration
 * Using a pool is more efficient for multiple simultaneous requests.
 * Credentials are pulled from environment variables for security.
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * POST /query
 * Endpoint to execute SQL queries.
 * @param {string} query - The raw SQL query string from the user.
 */
app.post('/query', async (req, res) => {
    const { query } = req.body;

    // Basic validation to ensure the query is not empty
    if (!query) {
        return res.status(400).json({
            error: 'Empty query',
            code: 'EMPTY_QUERY'
        });
    }

    /**
     * Security Middleware Logic:
     * We convert the query to lowercase and trim whitespace to verify it starts with 'SELECT'.
     * This prevents destructive operations like DELETE, UPDATE, or DROP in this version.
     */
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
        return res.status(403).json({
            error: 'Query forbidden: Only SELECT requests are allowed currently.',
            code: 'FORBIDDEN_QUERY'
        });
    }

    try {
        // Execute the query using the connection pool
        const [rows, fields] = await pool.query(query);
        // data: the resulting rows from the DB
        // fields: mapping the metadata to get column names for the frontend table
        res.json({ data: rows, fields: fields.map(f => f.name) });
    } catch (err) {
        console.error('MySQL Error Log:', err);

        /**
         * Error Response:
         * We map the MySQL error object to a JSON format the frontend can easily display.
         * Emphasizing 'errno' and 'sqlMessage' to mimic a real terminal output.
         */
        res.status(500).json({
            error: `Error Code: ${err.errno || 'N/A'}. ${err.sqlMessage || 'An unknown error occurred.'}`,
            code: err.code || 'UNKNOWN_ERROR',
            errno: err.errno,
            sqlState: err.sqlState
        });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Waiting for SELECT queries...`);
});

