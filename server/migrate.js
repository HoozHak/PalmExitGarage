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

const createTables = () => {
    console.log('Creating PalmExitGarage database tables...');
    
    // Customers table
    const customersTable = `
        CREATE TABLE IF NOT EXISTS customers (
            customer_id INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            address TEXT,
            city VARCHAR(100),
            state VARCHAR(50),
            zip_code VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    // Vehicles table
    const vehiclesTable = `
        CREATE TABLE IF NOT EXISTS vehicles (
            vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT NOT NULL,
            year INT NOT NULL,
            make VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            vin VARCHAR(50),
            license_plate VARCHAR(20),
            color VARCHAR(50),
            mileage INT,
            engine_size VARCHAR(50),
            transmission VARCHAR(50),
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
        )
    `;
    
    // Parts table
    const partsTable = `
        CREATE TABLE IF NOT EXISTS parts (
            part_id INT AUTO_INCREMENT PRIMARY KEY,
            brand VARCHAR(100) NOT NULL,
            item VARCHAR(255) NOT NULL,
            part_number VARCHAR(100),
            cost_cents INT NOT NULL,
            category VARCHAR(100),
            description TEXT,
            in_stock BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    // Labor table
    const laborTable = `
        CREATE TABLE IF NOT EXISTS labor (
            labor_id INT AUTO_INCREMENT PRIMARY KEY,
            labor_name VARCHAR(255) NOT NULL,
            labor_cost_cents INT NOT NULL,
            category VARCHAR(100),
            description TEXT,
            estimated_time_hours DECIMAL(4, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    
    // Work Orders table (for saving estimates)
    const workOrdersTable = `
        CREATE TABLE IF NOT EXISTS work_orders (
            work_order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            customer_id BIGINT UNSIGNED NOT NULL,
            vehicle_id BIGINT UNSIGNED NOT NULL,
            status ENUM('estimate', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'estimate',
            subtotal_cents INT NOT NULL DEFAULT 0,
            tax_cents INT NOT NULL DEFAULT 0,
            total_cents INT NOT NULL DEFAULT 0,
            tax_rate DECIMAL(6, 4) DEFAULT 0.0825,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
        )
    `;
    
    // Work Order Parts junction table
    const workOrderPartsTable = `
        CREATE TABLE IF NOT EXISTS work_order_parts (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            work_order_id BIGINT UNSIGNED NOT NULL,
            part_id BIGINT UNSIGNED NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            cost_cents INT NOT NULL,
            FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
            FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE
        )
    `;
    
    // Work Order Labor junction table
    const workOrderLaborTable = `
        CREATE TABLE IF NOT EXISTS work_order_labor (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            work_order_id BIGINT UNSIGNED NOT NULL,
            labor_id BIGINT UNSIGNED NOT NULL,
            quantity DECIMAL(4, 2) NOT NULL DEFAULT 1,
            cost_cents INT NOT NULL,
            FOREIGN KEY (work_order_id) REFERENCES work_orders(work_order_id) ON DELETE CASCADE,
            FOREIGN KEY (labor_id) REFERENCES labor(labor_id) ON DELETE CASCADE
        )
    `;
    
    // Vehicle reference table (from your seed data)
    const vehicleReferenceTable = `
        CREATE TABLE IF NOT EXISTS vehicle_reference (
            vehicleID INT AUTO_INCREMENT PRIMARY KEY,
            make VARCHAR(64) NOT NULL,
            model VARCHAR(128) NOT NULL,
            year INT NOT NULL,
            INDEX idx_make_model_year (make, model, year)
        )
    `;
    
    // Create tables in proper order (respecting foreign key dependencies)
    const tables = [
        { name: 'customers', sql: customersTable },
        { name: 'vehicle_reference', sql: vehicleReferenceTable },
        { name: 'vehicles', sql: vehiclesTable },
        { name: 'parts', sql: partsTable },
        { name: 'labor', sql: laborTable },
        { name: 'work_orders', sql: workOrdersTable },
        { name: 'work_order_parts', sql: workOrderPartsTable },
        { name: 'work_order_labor', sql: workOrderLaborTable }
    ];
    
    let currentTable = 0;
    
    const createNextTable = () => {
        if (currentTable >= tables.length) {
            console.log('All PalmExitGarage tables created successfully!');
            db.end();
            return;
        }
        
        const table = tables[currentTable];
        db.query(table.sql, (err) => {
            if (err) {
                console.error(`Error creating ${table.name} table:`, err);
                return;
            }
            console.log(`${table.name} table created successfully`);
            currentTable++;
            createNextTable();
        });
    };
    
    createNextTable();
};

// Connect and create tables
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
    createTables();
});