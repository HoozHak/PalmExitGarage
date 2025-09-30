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

const addInventoryDeductedColumn = () => {
    console.log('Adding inventory_deducted column to work_orders table...');
    
    const queries = [
        // Add the inventory_deducted column
        `ALTER TABLE work_orders 
         ADD COLUMN inventory_deducted BOOLEAN DEFAULT FALSE COMMENT 'Tracks whether inventory has been deducted for this work order'`,
        
        // Update existing approved work orders to mark them as having inventory deducted
        // This assumes that any work order that is currently "Approved" or later statuses has already had inventory deducted
        `UPDATE work_orders 
         SET inventory_deducted = TRUE 
         WHERE status IN ('Approved', 'Started', 'Complete') OR status = 'approved'`
    ];
    
    let currentQuery = 0;
    
    const executeNextQuery = () => {
        if (currentQuery >= queries.length) {
            console.log('✅ Inventory deducted column added successfully!');
            console.log('📋 Migration completed:');
            console.log('   - Added inventory_deducted BOOLEAN column to work_orders table');
            console.log('   - Set inventory_deducted = TRUE for existing approved/completed work orders');
            console.log('');
            console.log('🔧 This prevents double-deduction of inventory when work order statuses are changed.');
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
            if (result.affectedRows !== undefined) {
                console.log(`   - Affected rows: ${result.affectedRows}`);
            }
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
    addInventoryDeductedColumn();
});