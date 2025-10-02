const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/database');

// Backup directory - stored in server/backups folder
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create database connection pool
const pool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    waitForConnections: true,
    connectionLimit: 10
});

/**
 * Get list of all databases on the MySQL server
 */
async function listDatabases() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query('SHOW DATABASES');
        
        // Filter out system databases
        const databases = rows
            .map(row => row.Database)
            .filter(db => !['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db));
        
        return databases;
    } catch (error) {
        throw new Error(`Failed to list databases: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Create a backup of specified database
 * @param {string} databaseName - Name of database to backup
 * @returns {Promise<{filename: string, filepath: string, size: number}>}
 */
async function createBackup(databaseName) {
    let connection;
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `${databaseName}_backup_${timestamp}.sql`;
        const filepath = path.join(BACKUP_DIR, filename);
        
        connection = await pool.getConnection();
        
        // Use the database
        await connection.query(`USE ${databaseName}`);
        
        // Start building SQL backup
        let sqlDump = `-- MySQL Database Backup\n`;
        sqlDump += `-- Database: ${databaseName}\n`;
        sqlDump += `-- Generated: ${new Date().toISOString()}\n\n`;
        sqlDump += `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;\n`;
        sqlDump += `USE \`${databaseName}\`;\n\n`;
        
        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableKey = `Tables_in_${databaseName}`;
        
        // Disable foreign key checks
        sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
        
        for (const tableRow of tables) {
            const tableName = tableRow[tableKey];
            
            // Get CREATE TABLE statement
            const [createResult] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
            sqlDump += `-- Table: ${tableName}\n`;
            sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            sqlDump += createResult[0]['Create Table'] + ';\n\n';
            
            // Get table data
            const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
            
            if (rows.length > 0) {
                sqlDump += `-- Data for table ${tableName}\n`;
                
                for (const row of rows) {
                    const columns = Object.keys(row);
                    const values = columns.map(col => {
                        const val = row[col];
                        if (val === null) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        // Escape single quotes and backslashes
                        const escaped = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                        return `'${escaped}'`;
                    });
                    
                    sqlDump += `INSERT INTO \`${tableName}\` (\`${columns.join('\`, \`')}\`) VALUES (${values.join(', ')});\n`;
                }
                sqlDump += '\n';
            }
        }
        
        // Re-enable foreign key checks
        sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`;
        
        // Write to file
        fs.writeFileSync(filepath, sqlDump, 'utf8');
        
        // Get file size
        const stats = fs.statSync(filepath);
        
        return {
            filename: filename,
            filepath: filepath,
            size: stats.size,
            database: databaseName,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        throw new Error(`Backup failed: ${error.message}`);
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Restore database from a backup file
 * @param {string} filename - Name of backup file in the backups directory
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function restoreBackup(filename) {
    let connection;
    try {
        const filepath = path.join(BACKUP_DIR, filename);
        
        // Check if file exists
        if (!fs.existsSync(filepath)) {
            throw new Error(`Backup file not found: ${filename}`);
        }
        
        // Extract database name from filename (format: dbname_backup_timestamp.sql)
        const databaseName = filename.split('_backup_')[0];
        
        console.log(`\n🔄 Starting database restore process...`);
        console.log(`📁 Backup file: ${filename}`);
        console.log(`🗄️  Target database: ${databaseName}`);
        
        // Read the SQL file
        const sqlContent = fs.readFileSync(filepath, 'utf8');
        console.log(`✅ Backup file loaded (${sqlContent.length} bytes)`);
        
        connection = await pool.getConnection();
        
        // Step 1: Get list of all existing tables in the database
        console.log(`\n📋 Step 1: Getting list of existing tables...`);
        const [existingTables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [databaseName]);
        
        console.log(`   Found ${existingTables.length} existing tables`);
        
        // Step 2: Disable foreign key checks to allow dropping tables
        console.log(`\n🔓 Step 2: Disabling foreign key checks...`);
        await connection.query('SET FOREIGN_KEY_CHECKS=0');
        
        // Step 3: Drop all existing tables
        console.log(`\n🗑️  Step 3: Dropping existing tables...`);
        for (const table of existingTables) {
            const tableName = table.table_name || table.TABLE_NAME;
            console.log(`   Dropping table: ${tableName}`);
            await connection.query(`DROP TABLE IF EXISTS \`${databaseName}\`.\`${tableName}\``);
        }
        console.log(`   ✅ All existing tables dropped`);
        
        // Step 4: Execute the backup SQL to recreate tables and data
        console.log(`\n📥 Step 4: Restoring from backup file...`);
        
        // Split SQL content into individual statements
        // Split by semicolon followed by newline, but be careful with data containing semicolons
        const statements = sqlContent
            .split(/;\s*\n/)
            .map(s => s.trim())
            .filter(s => {
                // Filter out empty statements and comments
                if (s.length === 0) return false;
                if (s.startsWith('--')) return false;
                if (s.startsWith('/*') && s.endsWith('*/')) return false;
                return true;
            });
        
        console.log(`   Found ${statements.length} SQL statements to execute`);
        
        let statementsExecuted = 0;
        let tablesCreated = 0;
        let rowsInserted = 0;
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                try {
                    // Add semicolon back if not present
                    const finalStatement = statement.endsWith(';') ? statement : statement + ';';
                    const result = await connection.query(finalStatement);
                    
                    // Track what type of statement was executed
                    if (statement.toUpperCase().includes('CREATE TABLE')) {
                        tablesCreated++;
                        const match = statement.match(/CREATE TABLE[\s\S]*?`(\w+)`/);
                        if (match) {
                            console.log(`   ✅ Created table: ${match[1]}`);
                        }
                    } else if (statement.toUpperCase().startsWith('INSERT INTO')) {
                        rowsInserted++;
                        if (rowsInserted % 100 === 0) {
                            console.log(`   📊 Inserted ${rowsInserted} rows...`);
                        }
                    }
                    
                    statementsExecuted++;
                } catch (err) {
                    // Log but continue with other statements
                    console.error(`   ⚠️  Error executing statement ${i + 1}: ${err.message}`);
                    console.error(`   Statement preview: ${statement.substring(0, 100)}...`);
                    // Don't throw - continue with remaining statements
                }
            }
        }
        
        // Step 5: Re-enable foreign key checks
        console.log(`\n🔒 Step 5: Re-enabling foreign key checks...`);
        await connection.query('SET FOREIGN_KEY_CHECKS=1');
        
        console.log(`\n✅ Database restore completed successfully!`);
        console.log(`📊 Statistics:`);
        console.log(`   - Statements executed: ${statementsExecuted}`);
        console.log(`   - Tables created: ${tablesCreated}`);
        console.log(`   - Rows inserted: ${rowsInserted}`);
        console.log(``);
        
        return {
            success: true,
            message: `Database '${databaseName}' restored successfully from ${filename}. ${tablesCreated} tables created, ${rowsInserted} rows inserted.`,
            database: databaseName,
            timestamp: new Date().toISOString(),
            statistics: {
                statementsExecuted,
                tablesCreated,
                rowsInserted
            }
        };
    } catch (error) {
        console.error(`\n❌ Restore failed: ${error.message}`);
        console.error(error.stack);
        throw new Error(`Restore failed: ${error.message}`);
    } finally {
        if (connection) {
            // Make sure to re-enable foreign keys even if there was an error
            try {
                await connection.query('SET FOREIGN_KEY_CHECKS=1');
            } catch (err) {
                console.error('Error re-enabling foreign key checks:', err.message);
            }
            connection.release();
        }
    }
}

/**
 * List all available backup files
 * @returns {Array<{filename: string, size: number, created: Date, database: string}>}
 */
function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
        return [];
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.endsWith('.sql'))
        .map(file => {
            const filepath = path.join(BACKUP_DIR, file);
            const stats = fs.statSync(filepath);
            const database = file.split('_backup_')[0];
            
            return {
                filename: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                database: database
            };
        })
        .sort((a, b) => b.created - a.created); // Sort by newest first
    
    return files;
}

/**
 * Delete a backup file
 * @param {string} filename - Name of backup file to delete
 */
function deleteBackup(filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(BACKUP_DIR, filename);
        
        if (!fs.existsSync(filepath)) {
            reject(new Error(`Backup file not found: ${filename}`));
            return;
        }
        
        fs.unlink(filepath, (error) => {
            if (error) {
                reject(new Error(`Failed to delete backup: ${error.message}`));
                return;
            }
            
            resolve({
                success: true,
                message: `Backup file '${filename}' deleted successfully`
            });
        });
    });
}

/**
 * Get the backup directory path
 */
function getBackupDirectory() {
    return BACKUP_DIR;
}

module.exports = {
    listDatabases,
    createBackup,
    restoreBackup,
    listBackups,
    deleteBackup,
    getBackupDirectory
};
