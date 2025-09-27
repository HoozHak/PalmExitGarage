const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'user',
    password: 'password',
    database: 'car_repair'
});

const seedVehicleReference = () => {
    console.log('Seeding vehicle reference table...');
    
    // Path to your vehicle SQL file
    const vehicleSqlPath = 'C:\\Users\\HoozHak\\Downloads\\vehicles_seed_2011_2025_us.sql';
    
    try {
        // Read the SQL file
        const sqlContent = fs.readFileSync(vehicleSqlPath, 'utf8');
        
        // Replace the table name from "Vehicle" to "vehicle_reference"
        const modifiedSql = sqlContent.replace(/INSERT INTO Vehicle/g, 'INSERT INTO vehicle_reference');
        
        // Split into individual queries
        const queries = modifiedSql.split(';').filter(query => query.trim().length > 0);
        
        let queryIndex = 0;
        
        const executeNextQuery = () => {
            if (queryIndex >= queries.length) {
                console.log('Vehicle reference table seeded successfully!');
                db.end();
                return;
            }
            
            const query = queries[queryIndex].trim();
            if (query) {
                db.query(query, (err) => {
                    if (err) {
                        console.error(`Error executing query ${queryIndex + 1}:`, err);
                        return;
                    }
                    console.log(`Query ${queryIndex + 1}/${queries.length} completed`);
                    queryIndex++;
                    executeNextQuery();
                });
            } else {
                queryIndex++;
                executeNextQuery();
            }
        };
        
        executeNextQuery();
        
    } catch (error) {
        console.error('Error reading vehicle SQL file:', error);
        db.end();
    }
};

// Connect and seed
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
    seedVehicleReference();
});