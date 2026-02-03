// Centralized database configuration
// Uses environment variables with sensible defaults.
// Create a .env file in the server directory to override.

require('dotenv').config();

module.exports = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'palmexitgarage',

    // Connection options
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 60000
};
