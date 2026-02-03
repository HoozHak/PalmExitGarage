const mysql = require('mysql2');
const dbConfig = require('../config/database');

const db = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

console.log('🔄 Migrating parts table to add wholesale/retail cost columns...\n');

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to database\n');
    
    // Check if columns already exist
    db.query("SHOW COLUMNS FROM parts LIKE 'cost_paid_cents'", (err, results) => {
        if (err) {
            console.error('❌ Error checking table:', err.message);
            db.end();
            return;
        }
        
        if (results.length > 0) {
            console.log('ℹ️  Columns already exist. Migration not needed.');
            db.end();
            return;
        }
        
        console.log('📝 Adding new columns to parts table...');
        
        // Add new columns
        const alterQuery = `
            ALTER TABLE parts
            ADD COLUMN cost_paid_cents INT DEFAULT 0 COMMENT 'Wholesale cost in cents' AFTER part_number,
            ADD COLUMN cost_charged_cents INT DEFAULT 0 COMMENT 'Retail price charged to customer in cents' AFTER cost_paid_cents,
            ADD COLUMN profit_cents INT DEFAULT 0 COMMENT 'Profit margin in cents' AFTER cost_charged_cents,
            ADD COLUMN quantity_on_hand INT DEFAULT 0 COMMENT 'Quantity available in stock' AFTER description
        `;
        
        db.query(alterQuery, (err) => {
            if (err) {
                console.error('❌ Error adding columns:', err.message);
                db.end();
                return;
            }
            
            console.log('✅ New columns added successfully\n');
            console.log('📊 Migrating existing data...');
            
            // Migrate existing cost_cents data
            // Assume existing cost_cents is wholesale, calculate 10% markup for retail
            const migrateQuery = `
                UPDATE parts SET
                    cost_paid_cents = cost_cents,
                    cost_charged_cents = ROUND(cost_cents * 1.10),
                    profit_cents = ROUND(cost_cents * 1.10) - cost_cents,
                    quantity_on_hand = CASE WHEN in_stock = 1 THEN 1 ELSE 0 END
            `;
            
            db.query(migrateQuery, (err, result) => {
                if (err) {
                    console.error('❌ Error migrating data:', err.message);
                    db.end();
                    return;
                }
                
                console.log(`✅ Migrated ${result.affectedRows} parts with 10% markup`);
                console.log('\n📋 Migration Summary:');
                console.log('   • cost_paid_cents: Wholesale cost (from original cost_cents)');
                console.log('   • cost_charged_cents: Retail price (wholesale + 10%)');
                console.log('   • profit_cents: Calculated profit margin');
                console.log('   • quantity_on_hand: Stock quantity\n');
                
                // Show sample of migrated data
                db.query('SELECT brand, item, cost_paid_cents, cost_charged_cents, profit_cents FROM parts LIMIT 5', (err, samples) => {
                    if (!err) {
                        console.log('📦 Sample migrated parts:');
                        samples.forEach(p => {
                            console.log(`   ${p.brand} ${p.item}`);
                            console.log(`      Wholesale: $${(p.cost_paid_cents/100).toFixed(2)} | Retail: $${(p.cost_charged_cents/100).toFixed(2)} | Profit: $${(p.profit_cents/100).toFixed(2)}`);
                        });
                    }
                    
                    console.log('\n✅ Migration completed successfully!');
                    db.end();
                });
            });
        });
    });
});
