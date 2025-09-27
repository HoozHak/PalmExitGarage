const mysql = require('mysql2');

// Try different database configurations
const configs = [
    { host: 'localhost', port: 3307, user: 'user', password: 'password', database: 'car_repair' },
    { host: 'localhost', port: 3307, user: 'user', password: 'password' }, // No specific database
    { host: 'localhost', port: 3306, user: 'root', password: '', database: 'car_repair' },
    { host: 'localhost', port: 3306, user: 'root', password: '' }
];

console.log('🔍 Checking database connectivity...\n');

function testConnection(config, index) {
    return new Promise((resolve) => {
        const db = mysql.createConnection(config);
        
        db.connect((err) => {
            if (err) {
                console.log(`❌ Config ${index + 1}: ${err.message}`);
                resolve(false);
            } else {
                console.log(`✅ Config ${index + 1}: Connected successfully`);
                console.log(`   Host: ${config.host}:${config.port || 3306}`);
                console.log(`   User: ${config.user}`);
                console.log(`   Database: ${config.database || 'none specified'}\n`);
                
                // Show available databases
                db.query('SHOW DATABASES', (err, results) => {
                    if (!err) {
                        console.log('📋 Available databases:');
                        results.forEach(row => {
                            const dbName = Object.values(row)[0];
                            console.log(`   - ${dbName}`);
                        });
                        console.log();
                    }
                    db.end();
                    resolve(true);
                });
            }
        });
    });
}

async function checkAllConnections() {
    for (let i = 0; i < configs.length; i++) {
        const success = await testConnection(configs[i], i);
        if (success) break; // Stop at first successful connection
    }
}

// Run the check
checkAllConnections();
