const mysql = require('mysql2');
const dbConfig = require('./config/database');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database');
    
    // Check parts table structure
    db.query('DESCRIBE parts', (err, results) => {
        if (err) {
            console.error('❌ Error describing parts table:', err.message);
            db.end();
            return;
        }
        
        console.log('\n📋 Current parts table structure:');
        console.log('=====================================');
        results.forEach(column => {
            console.log(`${column.Field.padEnd(25)} | ${column.Type.padEnd(15)} | ${column.Null.padEnd(5)} | ${column.Key.padEnd(5)} | ${column.Default || 'NULL'}`);
        });
        
        console.log('\n📊 Sample parts data:');
        console.log('====================');
        db.query('SELECT * FROM parts LIMIT 3', (err, results) => {
            if (err) {
                console.error('❌ Error querying parts:', err.message);
            } else {
                console.log(results);
            }
            db.end();
        });
    });
});