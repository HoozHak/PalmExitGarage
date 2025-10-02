// Centralized database configuration
// This file ensures all parts of the application use consistent database settings
// Update these settings to match your MySQL database configuration

module.exports = {
    host: 'localhost',        // Database host (e.g., 'localhost' or remote host)
    port: 3306,               // MySQL port (default: 3306)
    user: 'root',             // Database username
    password: 'Icanttellyou1',      // Database password
    database: 'palmexitgarage', // Main database name
    
    // Connection options
    connectTimeout: 60000     // Connection timeout in milliseconds
};
