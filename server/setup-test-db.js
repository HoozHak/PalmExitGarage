/**
 * Setup Test Database
 * Creates palmexitgarage_test database and copies schema from palmexitgarage
 * Run this once to set up your test environment
 */

const mysql = require('mysql2/promise');

async function setupTestDatabase() {
    console.log('🔧 Setting up test database...\n');

    // Connect to MySQL (without specifying a database)
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3308,
        user: 'root',
        password: 'example'
    });

    try {
        // Create test database if it doesn't exist
        console.log('📦 Creating palmexitgarage_test database...');
        await connection.query('CREATE DATABASE IF NOT EXISTS palmexitgarage_test');
        console.log('✅ Database created/verified\n');

        // Switch to production database to get table structures
        await connection.query('USE palmexitgarage');

        // Get list of all tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        console.log('📋 Found tables:', tableNames.join(', '), '\n');

        // Switch to test database
        await connection.query('USE palmexitgarage_test');

        // Copy table structures (without data)
        for (const tableName of tableNames) {
            console.log(`  Creating table: ${tableName}`);
            
            // Get create statement from production
            const [createResult] = await connection.query(`SHOW CREATE TABLE palmexitgarage.${tableName}`);
            const createStatement = createResult[0]['Create Table'];
            
            // Drop if exists and create in test database
            await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
            await connection.query(createStatement);
        }

        console.log('\n✅ All table structures copied!\n');

        // Optional: Copy data from production (commented out by default)
        console.log('💡 To copy data from production, uncomment the code below');
        console.log('   or run a backup from production and restore to test\n');

        /*
        // Uncomment this section if you want to copy all data
        for (const tableName of tableNames) {
            console.log(`  Copying data: ${tableName}`);
            await connection.query(`INSERT INTO ${tableName} SELECT * FROM palmexitgarage.${tableName}`);
        }
        console.log('\n✅ All data copied!\n');
        */

        console.log('🎉 Test database setup complete!');
        console.log('📌 Database: palmexitgarage_test');
        console.log('📌 Port: 3308');
        console.log('\nYou can now start your test server safely!\n');

    } catch (error) {
        console.error('❌ Error setting up test database:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run the setup
setupTestDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
