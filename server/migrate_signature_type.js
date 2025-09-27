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

// Migration to add signature_type field to work_orders table
const addSignatureTypeField = () => {
    console.log('Adding signature_type field to work_orders table...');
    
    const alterQuery = `
        ALTER TABLE work_orders 
        ADD COLUMN signature_type ENUM('drawn', 'typed') NULL 
        COMMENT 'Type of signature: drawn (mouse/pen) or typed (electronic)'
    `;
    
    db.query(alterQuery, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Field signature_type already exists');
            } else {
                console.error('Error adding signature_type field:', err.message);
            }
        } else {
            console.log('✓ Successfully added signature_type field');
        }
        
        db.end();
        console.log('Migration completed!');
    });
};

// Connect to database and run migration
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
    addSignatureTypeField();
});