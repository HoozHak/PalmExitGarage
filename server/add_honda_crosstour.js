const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'user',
    password: 'password',
    database: 'palm_exit_garage'
});

// Honda Crosstour model data - produced from 2010-2015
const hondaCrosstourData = [
    // 2010 Models
    { year: 2010, make: 'Honda', model: 'Crosstour EX' },
    { year: 2010, make: 'Honda', model: 'Crosstour EX-L' },
    
    // 2011 Models
    { year: 2011, make: 'Honda', model: 'Crosstour EX' },
    { year: 2011, make: 'Honda', model: 'Crosstour EX-L' },
    
    // 2012 Models
    { year: 2012, make: 'Honda', model: 'Crosstour EX' },
    { year: 2012, make: 'Honda', model: 'Crosstour EX-L' },
    { year: 2012, make: 'Honda', model: 'Crosstour EX-L V6' },
    
    // 2013 Models (Refreshed design)
    { year: 2013, make: 'Honda', model: 'Crosstour EX' },
    { year: 2013, make: 'Honda', model: 'Crosstour EX-L' },
    { year: 2013, make: 'Honda', model: 'Crosstour EX-L V6' },
    
    // 2014 Models
    { year: 2014, make: 'Honda', model: 'Crosstour EX' },
    { year: 2014, make: 'Honda', model: 'Crosstour EX-L' },
    { year: 2014, make: 'Honda', model: 'Crosstour EX-L V6' },
    
    // 2015 Models (Final year)
    { year: 2015, make: 'Honda', model: 'Crosstour EX' },
    { year: 2015, make: 'Honda', model: 'Crosstour EX-L' },
    { year: 2015, make: 'Honda', model: 'Crosstour EX-L V6' }
];

console.log('🚗 Adding Honda Crosstour models to vehicle reference database...');
console.log('==============================================================\n');

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database\n');
    
    // First, check if vehicle_reference table exists
    db.query('SHOW TABLES LIKE "vehicle_reference"', (err, result) => {
        if (err) {
            console.error('❌ Error checking for table:', err.message);
            db.end();
            return;
        }
        
        if (result.length === 0) {
            console.log('⚠️  vehicle_reference table does not exist. Creating it...');
            createVehicleReferenceTable();
        } else {
            console.log('✅ vehicle_reference table found');
            addCrosstourModels();
        }
    });
});

function createVehicleReferenceTable() {
    const createTableQuery = `
        CREATE TABLE vehicle_reference (
            id INT AUTO_INCREMENT PRIMARY KEY,
            year INT NOT NULL,
            make VARCHAR(50) NOT NULL,
            model VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_make_model (make, model),
            INDEX idx_year (year),
            UNIQUE KEY unique_vehicle (year, make, model)
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('❌ Error creating vehicle_reference table:', err.message);
            db.end();
            return;
        }
        console.log('✅ vehicle_reference table created successfully\n');
        addCrosstourModels();
    });
}

function addCrosstourModels() {
    // Check if any Honda Crosstour models already exist
    db.query('SELECT COUNT(*) as count FROM vehicle_reference WHERE make = "Honda" AND model LIKE "%Crosstour%"', (err, result) => {
        if (err) {
            console.error('❌ Error checking existing records:', err.message);
            db.end();
            return;
        }
        
        const existingCount = result[0].count;
        console.log(`📊 Found ${existingCount} existing Honda Crosstour models in database\n`);
        
        // Prepare insert query with ON DUPLICATE KEY UPDATE to avoid duplicates
        const insertQuery = `
            INSERT INTO vehicle_reference (year, make, model)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                make = VALUES(make),
                model = VALUES(model)
        `;
        
        let insertedCount = 0;
        let updatedCount = 0;
        let processedCount = 0;
        
        console.log('🔄 Adding Honda Crosstour models...\n');
        
        hondaCrosstourData.forEach((vehicle, index) => {
            db.query(insertQuery, [vehicle.year, vehicle.make, vehicle.model], (err, result) => {
                processedCount++;
                
                if (err) {
                    console.log(`❌ Error adding ${vehicle.year} ${vehicle.model}: ${err.message}`);
                } else {
                    if (result.affectedRows === 1) {
                        insertedCount++;
                        console.log(`✅ Added: ${vehicle.year} ${vehicle.model}`);
                    } else if (result.affectedRows === 2) {
                        updatedCount++;
                        console.log(`🔄 Updated: ${vehicle.year} ${vehicle.model}`);
                    } else {
                        console.log(`ℹ️  Already exists: ${vehicle.year} ${vehicle.model}`);
                    }
                }
                
                // If this is the last item, show summary and close connection
                if (processedCount === hondaCrosstourData.length) {
                    showSummaryAndClose(insertedCount, updatedCount, existingCount);
                }
            });
        });
    });
}

function showSummaryAndClose(inserted, updated, existingBefore) {
    console.log('\n🎉 Honda Crosstour Import Complete!');
    console.log('==================================');
    console.log(`📈 New records inserted: ${inserted}`);
    console.log(`🔄 Records updated: ${updated}`);
    console.log(`📊 Records before import: ${existingBefore}`);
    console.log(`📋 Total Honda Crosstour models processed: ${hondaCrosstourData.length}`);
    
    // Verify final count
    db.query('SELECT COUNT(*) as count FROM vehicle_reference WHERE make = "Honda" AND model LIKE "%Crosstour%"', (err, result) => {
        if (!err) {
            console.log(`✅ Final count of Honda Crosstour models: ${result[0].count}`);
        }
        
        console.log('\n🔗 Database Connection Details:');
        console.log('Host: localhost:3307');
        console.log('Database: palm_exit_garage');
        console.log('Table: vehicle_reference');
        console.log('\n✨ You can now use these Honda Crosstour models in your vehicle selection forms!');
        
        db.end();
    });
}