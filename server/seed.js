const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'user',
    password: 'password',
    database: 'car_repair'
});

const seedData = () => {
    console.log('Seeding PalmExitGarage database with sample data...');
    
    // Sample customers
    const customers = [
        { first_name: 'John', last_name: 'Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', address: '123 Main St', city: 'Orlando', state: 'FL', zip_code: '32801' },
        { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@email.com', phone: '(555) 987-6543', address: '456 Oak Ave', city: 'Orlando', state: 'FL', zip_code: '32802' },
        { first_name: 'Mike', last_name: 'Davis', email: 'mike.davis@email.com', phone: '(555) 555-0123', address: '789 Pine St', city: 'Winter Park', state: 'FL', zip_code: '32789' },
        { first_name: 'Lisa', last_name: 'Wilson', email: 'lisa.w@email.com', phone: '(555) 444-7890', address: '321 Elm Dr', city: 'Kissimmee', state: 'FL', zip_code: '34741' }
    ];
    
    // Sample parts (prices in cents)
    const parts = [
        { brand: 'ACDelco', item: 'Oil Filter', part_number: 'PF457G', cost_cents: 899, category: 'Engine', description: 'Premium oil filter for most GM vehicles' },
        { brand: 'Bosch', item: 'Air Filter', part_number: '5544WS', cost_cents: 1299, category: 'Engine', description: 'High-quality air filter' },
        { brand: 'Wagner', item: 'Brake Pads - Front', part_number: 'ZD465', cost_cents: 4599, category: 'Brakes', description: 'Ceramic brake pads, front set' },
        { brand: 'Wagner', item: 'Brake Pads - Rear', part_number: 'ZD466', cost_cents: 3899, category: 'Brakes', description: 'Ceramic brake pads, rear set' },
        { brand: 'Monroe', item: 'Shock Absorber', part_number: '71339', cost_cents: 6799, category: 'Suspension', description: 'Gas-charged shock absorber' },
        { brand: 'Valvoline', item: 'Motor Oil (5W-30)', part_number: 'VV966', cost_cents: 2499, category: 'Fluids', description: '5 quart jug synthetic blend' },
        { brand: 'Interstate', item: 'Car Battery', part_number: 'MTP-94R', cost_cents: 12999, category: 'Electrical', description: '650 CCA maintenance-free battery' },
        { brand: 'Gates', item: 'Serpentine Belt', part_number: 'K060965', cost_cents: 1899, category: 'Engine', description: 'Micro-V belt for accessory drive' },
        { brand: 'Denso', item: 'Spark Plugs (Set of 4)', part_number: 'IK20', cost_cents: 2799, category: 'Engine', description: 'Iridium spark plugs, set of 4' },
        { brand: 'Mobil 1', item: 'Transmission Fluid', part_number: 'ATF320', cost_cents: 899, category: 'Fluids', description: 'Full synthetic ATF, 1 quart' }
    ];
    
    // Sample labor items (prices in cents)
    const labor = [
        { labor_name: 'Oil Change Service', labor_cost_cents: 2999, category: 'Maintenance', description: 'Standard oil and filter change', estimated_time_hours: 0.5 },
        { labor_name: 'Brake Inspection', labor_cost_cents: 4999, category: 'Brakes', description: 'Complete brake system inspection', estimated_time_hours: 1.0 },
        { labor_name: 'Front Brake Pad Replacement', labor_cost_cents: 8999, category: 'Brakes', description: 'Replace front brake pads', estimated_time_hours: 1.5 },
        { labor_name: 'Rear Brake Pad Replacement', labor_cost_cents: 7999, category: 'Brakes', description: 'Replace rear brake pads', estimated_time_hours: 1.25 },
        { labor_name: 'Battery Installation', labor_cost_cents: 1999, category: 'Electrical', description: 'Install new battery and test charging system', estimated_time_hours: 0.25 },
        { labor_name: 'Air Filter Replacement', labor_cost_cents: 1499, category: 'Engine', description: 'Replace engine air filter', estimated_time_hours: 0.25 },
        { labor_name: 'Spark Plug Replacement', labor_cost_cents: 12999, category: 'Engine', description: 'Replace spark plugs (4-cylinder)', estimated_time_hours: 2.0 },
        { labor_name: 'Transmission Service', labor_cost_cents: 15999, category: 'Transmission', description: 'Drain and fill transmission fluid', estimated_time_hours: 1.0 },
        { labor_name: 'Serpentine Belt Replacement', labor_cost_cents: 6999, category: 'Engine', description: 'Replace accessory drive belt', estimated_time_hours: 1.0 },
        { labor_name: 'Shock Absorber Installation', labor_cost_cents: 8999, category: 'Suspension', description: 'Install shock absorber (per unit)', estimated_time_hours: 1.5 }
    ];
    
    // Insert customers first
    const insertCustomers = () => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code) VALUES ?';
            const values = customers.map(c => [c.first_name, c.last_name, c.email, c.phone, c.address, c.city, c.state, c.zip_code]);
            
            db.query(query, [values], (err, result) => {
                if (err) reject(err);
                else {
                    console.log(`${result.affectedRows} customers inserted`);
                    resolve();
                }
            });
        });
    };
    
    // Insert sample vehicles
    const insertVehicles = () => {
        return new Promise((resolve, reject) => {
            const vehicles = [
                { customer_id: 1, year: 2018, make: 'Honda', model: 'Civic', vin: '1HGBH41JXMN109186', license_plate: 'ABC123', color: 'Silver', mileage: 45000 },
                { customer_id: 1, year: 2015, make: 'Toyota', model: 'Camry', vin: '4T1BF1FK8FU123456', license_plate: 'XYZ789', color: 'White', mileage: 78000 },
                { customer_id: 2, year: 2020, make: 'Ford', model: 'F-150', vin: '1FTEW1EP0LKF12345', license_plate: 'DEF456', color: 'Blue', mileage: 25000 },
                { customer_id: 3, year: 2017, make: 'Chevrolet', model: 'Malibu', vin: '1G1ZE5ST4HF123456', license_plate: 'GHI789', color: 'Red', mileage: 62000 },
                { customer_id: 4, year: 2019, make: 'Nissan', model: 'Altima', vin: '1N4AL3AP6KC123456', license_plate: 'JKL012', color: 'Black', mileage: 35000 }
            ];
            
            const query = 'INSERT INTO vehicles (customer_id, year, make, model, vin, license_plate, color, mileage) VALUES ?';
            const values = vehicles.map(v => [v.customer_id, v.year, v.make, v.model, v.vin, v.license_plate, v.color, v.mileage]);
            
            db.query(query, [values], (err, result) => {
                if (err) reject(err);
                else {
                    console.log(`${result.affectedRows} vehicles inserted`);
                    resolve();
                }
            });
        });
    };
    
    // Insert parts
    const insertParts = () => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO parts (brand, item, part_number, cost_cents, category, description) VALUES ?';
            const values = parts.map(p => [p.brand, p.item, p.part_number, p.cost_cents, p.category, p.description]);
            
            db.query(query, [values], (err, result) => {
                if (err) reject(err);
                else {
                    console.log(`${result.affectedRows} parts inserted`);
                    resolve();
                }
            });
        });
    };
    
    // Insert labor
    const insertLabor = () => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO labor (labor_name, labor_cost_cents, category, description, estimated_time_hours) VALUES ?';
            const values = labor.map(l => [l.labor_name, l.labor_cost_cents, l.category, l.description, l.estimated_time_hours]);
            
            db.query(query, [values], (err, result) => {
                if (err) reject(err);
                else {
                    console.log(`${result.affectedRows} labor items inserted`);
                    resolve();
                }
            });
        });
    };
    
    // Run all inserts sequentially
    insertCustomers()
        .then(() => insertVehicles())
        .then(() => insertParts())
        .then(() => insertLabor())
        .then(() => {
            console.log('All sample data inserted successfully!');
            db.end();
        })
        .catch(err => {
            console.error('Error seeding database:', err);
            db.end();
        });
};

// Connect and seed data
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
    seedData();
});