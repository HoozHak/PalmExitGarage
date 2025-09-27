const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'user',
    password: 'password',
    database: 'car_repair'
});

// Migration to add signature fields to work_orders table
const addSignatureFields = () => {
    console.log('Adding signature fields to work_orders table...');
    
    const alterQueries = [
        `ALTER TABLE work_orders 
         ADD COLUMN signature_data LONGTEXT NULL 
         COMMENT 'Base64 encoded signature image data'`,
        
        `ALTER TABLE work_orders 
         ADD COLUMN customer_signature_name VARCHAR(255) NULL 
         COMMENT 'Customer printed name for signature'`,
         
        `ALTER TABLE work_orders 
         ADD COLUMN signed_date TIMESTAMP NULL 
         COMMENT 'Date and time when work order was signed'`,
         
        `ALTER TABLE work_orders 
         MODIFY COLUMN status ENUM('estimate', 'approved', 'in_progress', 'completed', 'cancelled') 
         DEFAULT 'estimate' 
         COMMENT 'Work order status'`
    ];
    
    // Execute each query
    alterQueries.forEach((query, index) => {
        db.query(query, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Field already exists (query ${index + 1})`);
                } else {
                    console.error(`Error in query ${index + 1}:`, err.message);
                }
            } else {
                console.log(`✓ Successfully executed query ${index + 1}`);
            }
            
            // Close connection after last query
            if (index === alterQueries.length - 1) {
                db.end();
                console.log('Migration completed!');
            }
        });
    });
};

// Connect to database and run migration
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
    addSignatureFields();
});