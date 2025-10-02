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

// Test customers data
const testCustomers = [
    {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0101',
        address: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701',
        vehicle: {
            year: 2018,
            make: 'Honda',
            model: 'Accord',
            vin: '1HGCV1F30JA123456',
            license_plate: 'ABC1234',
            color: 'Silver',
            mileage: 45000,
            engine_size: '2.0L Turbo',
            transmission: 'Automatic',
            notes: 'Regular maintenance customer'
        }
    },
    {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '555-0102',
        address: '456 Oak Ave',
        city: 'Austin',
        state: 'TX',
        zip_code: '78702',
        vehicle: {
            year: 2020,
            make: 'Toyota',
            model: 'RAV4',
            vin: '2T3P1RFV8LC123789',
            license_plate: 'XYZ5678',
            color: 'Blue',
            mileage: 28000,
            engine_size: '2.5L',
            transmission: 'Automatic',
            notes: 'New customer - first visit'
        }
    }
];

const seedTestData = async () => {
    console.log('Starting to seed test data...\n');
    
    for (const customer of testCustomers) {
        try {
            // Insert customer
            const customerResult = await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE customer_id=LAST_INSERT_ID(customer_id)`,
                    [customer.first_name, customer.last_name, customer.email, customer.phone, 
                     customer.address, customer.city, customer.state, customer.zip_code],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            
            const customerId = customerResult.insertId;
            console.log(`✓ Created customer: ${customer.first_name} ${customer.last_name} (ID: ${customerId})`);
            
            // Insert vehicle
            const vehicleResult = await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO vehicles (customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [customerId, customer.vehicle.year, customer.vehicle.make, customer.vehicle.model,
                     customer.vehicle.vin, customer.vehicle.license_plate, customer.vehicle.color,
                     customer.vehicle.mileage, customer.vehicle.engine_size, customer.vehicle.transmission,
                     customer.vehicle.notes],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            
            console.log(`  ✓ Added vehicle: ${customer.vehicle.year} ${customer.vehicle.make} ${customer.vehicle.model}\n`);
            
        } catch (error) {
            console.error(`✗ Error seeding customer ${customer.first_name} ${customer.last_name}:`, error.message);
        }
    }
    
    // Verify test data
    const customerCount = await new Promise((resolve, reject) => {
        db.query(
            `SELECT COUNT(*) as count FROM customers WHERE email IN ('john.doe@example.com', 'jane.smith@example.com')`,
            (err, result) => {
                if (err) reject(err);
                else resolve(result[0].count);
            }
        );
    });
    
    const vehicleCount = await new Promise((resolve, reject) => {
        db.query(
            `SELECT COUNT(*) as count FROM vehicles v 
             INNER JOIN customers c ON v.customer_id = c.customer_id 
             WHERE c.email IN ('john.doe@example.com', 'jane.smith@example.com')`,
            (err, result) => {
                if (err) reject(err);
                else resolve(result[0].count);
            }
        );
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test data seeded successfully!');
    console.log(`Total test customers: ${customerCount}`);
    console.log(`Total test vehicles: ${vehicleCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    db.end();
};

// Connect and seed data
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database\n');
    seedTestData().catch(error => {
        console.error('Error seeding test data:', error);
        db.end();
    });
});
