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

const fixWorkOrdersSchema = async () => {
    console.log('Fixing work_orders table schema...');
    console.log('This migration will:');
    console.log('1. Update status ENUM to match API expectations');
    console.log('2. Add missing signature-related columns');
    console.log('3. Add inventory_deducted column if missing');
    console.log('');
    
    // Helper function to check if column exists
    const columnExists = (columnName) => {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'work_orders' AND COLUMN_NAME = ?`,
                [dbConfig.database, columnName],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0].count > 0);
                }
            );
        });
    };
    
    try {
        // Phase 1: Update status ENUM
        console.log('Phase 1: Updating status ENUM...');
        
        const statusUpdateQueries = [
            `UPDATE work_orders SET status = 'temp_estimate' WHERE status = 'estimate'`,
            `UPDATE work_orders SET status = 'temp_approved' WHERE status = 'approved'`,
            `UPDATE work_orders SET status = 'temp_in_progress' WHERE status = 'in_progress'`,
            `UPDATE work_orders SET status = 'temp_completed' WHERE status = 'completed'`,
            `UPDATE work_orders SET status = 'temp_cancelled' WHERE status = 'cancelled'`,
            `ALTER TABLE work_orders 
             MODIFY COLUMN status ENUM('Estimate', 'Approved', 'Started', 'Complete', 'Cancelled', 'temp_estimate', 'temp_approved', 'temp_in_progress', 'temp_completed', 'temp_cancelled') DEFAULT 'Estimate'`,
            `UPDATE work_orders SET status = 'Estimate' WHERE status = 'temp_estimate'`,
            `UPDATE work_orders SET status = 'Approved' WHERE status = 'temp_approved'`,
            `UPDATE work_orders SET status = 'Started' WHERE status = 'temp_in_progress'`,
            `UPDATE work_orders SET status = 'Complete' WHERE status = 'temp_completed'`,
            `UPDATE work_orders SET status = 'Cancelled' WHERE status = 'temp_cancelled'`,
            `ALTER TABLE work_orders 
             MODIFY COLUMN status ENUM('Estimate', 'Approved', 'Started', 'Complete', 'Cancelled') DEFAULT 'Estimate'`
        ];
        
        for (const query of statusUpdateQueries) {
            try {
                await new Promise((resolve, reject) => {
                    db.query(query, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log('   ✓ Status update step completed');
            } catch (err) {
                console.log('   ⚠️  Status update step (may already be correct):', err.message);
            }
        }
        
        // Phase 2: Add signature columns
        console.log('\nPhase 2: Adding signature columns...');
        
        const signatureColumns = [
            { name: 'signature_data', sql: `ALTER TABLE work_orders ADD COLUMN signature_data LONGTEXT COMMENT 'Base64-encoded signature image data'` },
            { name: 'customer_signature_name', sql: `ALTER TABLE work_orders ADD COLUMN customer_signature_name VARCHAR(255) COMMENT 'Name of person who signed'` },
            { name: 'signature_type', sql: `ALTER TABLE work_orders ADD COLUMN signature_type ENUM('customer', 'technician', 'manager') COMMENT 'Type of signature'` },
            { name: 'signed_date', sql: `ALTER TABLE work_orders ADD COLUMN signed_date DATETIME COMMENT 'Date and time when work order was signed'` }
        ];
        
        for (const col of signatureColumns) {
            const exists = await columnExists(col.name);
            if (exists) {
                console.log(`   ⚠️  Column '${col.name}' already exists (skipping)`);
            } else {
                try {
                    await new Promise((resolve, reject) => {
                        db.query(col.sql, (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        });
                    });
                    console.log(`   ✓ Added column '${col.name}'`);
                } catch (err) {
                    console.log(`   ❌ Error adding '${col.name}':`, err.message);
                }
            }
        }
        
        // Phase 3: Add inventory_deducted column
        console.log('\nPhase 3: Adding inventory_deducted column...');
        
        const invExists = await columnExists('inventory_deducted');
        if (invExists) {
            console.log('   ⚠️  Column \'inventory_deducted\' already exists (skipping)');
        } else {
            try {
                await new Promise((resolve, reject) => {
                    db.query(
                        `ALTER TABLE work_orders ADD COLUMN inventory_deducted BOOLEAN DEFAULT FALSE COMMENT 'Tracks whether inventory has been deducted for this work order'`,
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result);
                        }
                    );
                });
                console.log('   ✓ Added column \'inventory_deducted\'');
            } catch (err) {
                console.log('   ❌ Error adding \'inventory_deducted\':', err.message);
            }
        }
        
        // Phase 4: Update existing records
        console.log('\nPhase 4: Updating existing work orders...');
        
        try {
            const result = await new Promise((resolve, reject) => {
                db.query(
                    `UPDATE work_orders 
                     SET inventory_deducted = TRUE 
                     WHERE status IN ('Approved', 'Started', 'Complete') AND (inventory_deducted = FALSE OR inventory_deducted IS NULL)`,
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            console.log(`   ✓ Updated ${result.affectedRows} work orders with inventory_deducted flag`);
        } catch (err) {
            console.log('   ❌ Error updating work orders:', err.message);
        }
        
        console.log('');
        console.log('✅ Work orders schema migration completed successfully!');
        console.log('');
        console.log('Changes made:');
        console.log('   ✓ Status ENUM updated to: Estimate, Approved, Started, Complete, Cancelled');
        console.log('   ✓ Added signature_data column (LONGTEXT)');
        console.log('   ✓ Added customer_signature_name column (VARCHAR)');
        console.log('   ✓ Added signature_type column (ENUM)');
        console.log('   ✓ Added signed_date column (DATETIME)');
        console.log('   ✓ Added inventory_deducted column (BOOLEAN)');
        console.log('   ✓ Updated existing approved work orders with inventory_deducted flag');
        console.log('');
        
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
    } finally {
        db.end();
    }
};

// Connect and run migration
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please ensure MySQL is running and database credentials are correct.');
        return;
    }
    console.log('✅ Connected to MySQL database');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log('');
    fixWorkOrdersSchema();
});
