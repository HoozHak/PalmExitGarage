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

const addPartsCostColumns = () => {
    console.log('Adding wholesale and retail cost columns to parts table...');
    
    const queries = [
        // First, add the new columns
        `ALTER TABLE parts 
         ADD COLUMN wholesale_cost_cents INT NOT NULL DEFAULT 0 COMMENT 'Cost paid for the part (wholesale price)',
         ADD COLUMN retail_cost_cents INT NOT NULL DEFAULT 0 COMMENT 'Price charged to customer (retail price)'`,
        
        // Copy existing cost_cents to both new columns as default
        `UPDATE parts 
         SET wholesale_cost_cents = cost_cents, 
             retail_cost_cents = cost_cents`,
        
        // Update quantity_on_hand based on in_stock (quantity_on_hand already exists)
        `UPDATE parts 
         SET quantity_on_hand = CASE WHEN in_stock = 1 THEN 1 ELSE 0 END 
         WHERE quantity_on_hand = 0`
    ];
    
    let currentQuery = 0;
    
    const executeNextQuery = () => {
        if (currentQuery >= queries.length) {
            console.log('✅ Parts table cost columns added successfully!');
            console.log('📋 Migration completed:');
            console.log('   - Added wholesale_cost_cents column');
            console.log('   - Added retail_cost_cents column');
            console.log('   - Added quantity_on_hand column');
            console.log('   - Migrated existing cost_cents data to both new columns');
            console.log('');
            console.log('⚠️  Note: The old cost_cents column is still present for compatibility.');
            console.log('   You may want to remove it later after verifying everything works.');
            db.end();
            return;
        }
        
        console.log(`Executing query ${currentQuery + 1}/${queries.length}...`);
        db.query(queries[currentQuery], (err, result) => {
            if (err) {
                console.error(`❌ Error executing query ${currentQuery + 1}:`, err.message);
                console.log('Query was:', queries[currentQuery]);
                db.end();
                return;
            }
            console.log(`✅ Query ${currentQuery + 1} completed successfully`);
            currentQuery++;
            executeNextQuery();
        });
    };
    
    executeNextQuery();
};

// Connect and run migration
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
    addPartsCostColumns();
});