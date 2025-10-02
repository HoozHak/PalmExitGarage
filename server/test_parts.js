const mysql = require('mysql2');
const dbConfig = require('./config/database');

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.log('❌ Error:', err.message);
        return;
    }
    
    console.log('✅ Connected to database\n');
    
    db.query('SELECT COUNT(*) as count FROM parts', (err, r) => {
        if (err) {
            console.log('❌ Error:', err.message);
        } else {
            console.log(`📦 Parts count: ${r[0].count}`);
        }
        
        db.query('SELECT * FROM parts LIMIT 10', (err, results) => {
            if (err) {
                console.log('❌ Error:', err.message);
            } else {
                console.log('\n📋 Sample parts:');
                results.forEach(p => {
                    console.log(`   - ${p.brand} ${p.item} (Part# ${p.part_number})`);
                    console.log(`     Cost: $${(p.cost_cents/100).toFixed(2)} | Category: ${p.category}`);
                });
            }
            
            // Check table structure
            db.query('DESCRIBE parts', (err, columns) => {
                if (!err) {
                    console.log('\n📊 Parts table structure:');
                    columns.forEach(col => {
                        console.log(`   ${col.Field}: ${col.Type}`);
                    });
                }
                db.end();
            });
        });
    });
});
