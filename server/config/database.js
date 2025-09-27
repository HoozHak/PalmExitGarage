// Centralized database configuration
// This file ensures all parts of the application use consistent database settings

module.exports = {
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: 'example',
    database: 'palmexitgarage',
    
    // Connection options
    connectTimeout: 60000,
    
    // Docker container settings (for reference)
    containerName: 'palmexitgarage-db',
    dockerPort: '3308:3306',
    volumeName: 'car-repair-app_db_data'
};