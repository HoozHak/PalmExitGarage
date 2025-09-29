const mysql = require('mysql2');
const dbConfig = require('../config/database');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

const createTaxSettingsTable = () => {
    console.log('Creating tax_settings table...');
    
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tax_settings (
            id INT PRIMARY KEY DEFAULT 1,
            tax_rate DECIMAL(6, 4) NOT NULL DEFAULT 0.0825,
            state VARCHAR(50) NOT NULL DEFAULT 'CA',
            description VARCHAR(255) NOT NULL DEFAULT 'California State Tax',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTableQuery, (err, result) => {
        if (err) {
            console.error('❌ Error creating tax_settings table:', err.message);
            db.end();
            return;
        }
        
        console.log('✅ Tax settings table created successfully');
        
        // Insert default California tax settings
        const insertDefaultQuery = `
            INSERT IGNORE INTO tax_settings (id, tax_rate, state, description) 
            VALUES (1, 0.0825, 'CA', 'California State Tax')
        `;
        
        db.query(insertDefaultQuery, (err, result) => {
            if (err) {
                console.error('❌ Error inserting default tax settings:', err.message);
            } else {
                console.log('✅ Default tax settings inserted (CA 8.25%)');
            }
            
            console.log('📋 Tax settings table migration completed successfully!');
            db.end();
        });
    });
};

// Connect and run migration
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
    createTaxSettingsTable();
});