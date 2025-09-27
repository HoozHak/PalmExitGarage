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

const laborItems = [
    // Engine Services
    { labor_name: 'Oil Change', labor_cost_cents: 4500, category: 'Engine', description: 'Standard oil and filter change', estimated_time_hours: 0.5 },
    { labor_name: 'Tune-Up (Basic)', labor_cost_cents: 12000, category: 'Engine', description: 'Spark plugs, filters, fluids check', estimated_time_hours: 2.0 },
    { labor_name: 'Engine Diagnostic', labor_cost_cents: 15000, category: 'Engine', description: 'Computer diagnostic scan and analysis', estimated_time_hours: 1.0 },
    { labor_name: 'Belt Replacement', labor_cost_cents: 8000, category: 'Engine', description: 'Serpentine or timing belt replacement', estimated_time_hours: 1.5 },
    { labor_name: 'Coolant System Flush', labor_cost_cents: 9500, category: 'Engine', description: 'Complete coolant system service', estimated_time_hours: 1.0 },
    
    // Brake Services
    { labor_name: 'Brake Pad Replacement (Front)', labor_cost_cents: 18000, category: 'Brakes', description: 'Replace front brake pads', estimated_time_hours: 2.0 },
    { labor_name: 'Brake Pad Replacement (Rear)', labor_cost_cents: 16000, category: 'Brakes', description: 'Replace rear brake pads', estimated_time_hours: 1.5 },
    { labor_name: 'Brake Rotor Replacement', labor_cost_cents: 22000, category: 'Brakes', description: 'Replace brake rotors', estimated_time_hours: 2.5 },
    { labor_name: 'Brake Fluid Service', labor_cost_cents: 8500, category: 'Brakes', description: 'Brake fluid flush and replacement', estimated_time_hours: 1.0 },
    { labor_name: 'Brake System Inspection', labor_cost_cents: 5000, category: 'Brakes', description: 'Complete brake system inspection', estimated_time_hours: 0.5 },
    
    // Transmission Services
    { labor_name: 'Transmission Fluid Change', labor_cost_cents: 12500, category: 'Transmission', description: 'Automatic transmission fluid service', estimated_time_hours: 1.0 },
    { labor_name: 'Transmission Diagnostic', labor_cost_cents: 18000, category: 'Transmission', description: 'Transmission performance diagnostic', estimated_time_hours: 1.5 },
    { labor_name: 'Clutch Replacement', labor_cost_cents: 45000, category: 'Transmission', description: 'Manual transmission clutch replacement', estimated_time_hours: 6.0 },
    
    // Electrical Services
    { labor_name: 'Battery Replacement', labor_cost_cents: 7500, category: 'Electrical', description: 'Car battery replacement and testing', estimated_time_hours: 0.5 },
    { labor_name: 'Alternator Replacement', labor_cost_cents: 28000, category: 'Electrical', description: 'Alternator replacement', estimated_time_hours: 3.0 },
    { labor_name: 'Starter Replacement', labor_cost_cents: 25000, category: 'Electrical', description: 'Starter motor replacement', estimated_time_hours: 2.5 },
    { labor_name: 'Electrical Diagnostic', labor_cost_cents: 15000, category: 'Electrical', description: 'Electrical system diagnostic', estimated_time_hours: 1.0 },
    
    // Suspension Services
    { labor_name: 'Shock Absorber Replacement', labor_cost_cents: 32000, category: 'Suspension', description: 'Replace shock absorbers', estimated_time_hours: 3.0 },
    { labor_name: 'Strut Replacement', labor_cost_cents: 38000, category: 'Suspension', description: 'Complete strut assembly replacement', estimated_time_hours: 4.0 },
    { labor_name: 'Wheel Alignment', labor_cost_cents: 12000, category: 'Suspension', description: 'Four-wheel alignment service', estimated_time_hours: 1.0 },
    { labor_name: 'Tire Rotation', labor_cost_cents: 3500, category: 'Suspension', description: 'Rotate and balance tires', estimated_time_hours: 0.5 },
    
    // AC/Heating Services
    { labor_name: 'A/C System Service', labor_cost_cents: 15000, category: 'HVAC', description: 'Air conditioning system service', estimated_time_hours: 1.5 },
    { labor_name: 'A/C Compressor Replacement', labor_cost_cents: 42000, category: 'HVAC', description: 'A/C compressor replacement', estimated_time_hours: 4.0 },
    { labor_name: 'Heater Core Replacement', labor_cost_cents: 55000, category: 'HVAC', description: 'Heater core replacement', estimated_time_hours: 6.0 },
    
    // General Services
    { labor_name: 'Multi-Point Inspection', labor_cost_cents: 8000, category: 'Inspection', description: 'Complete vehicle inspection', estimated_time_hours: 1.0 },
    { labor_name: 'State Inspection', labor_cost_cents: 2500, category: 'Inspection', description: 'State safety inspection', estimated_time_hours: 0.5 },
    { labor_name: 'Emissions Test', labor_cost_cents: 3500, category: 'Inspection', description: 'Emissions testing', estimated_time_hours: 0.5 },
    
    // Body/Exterior
    { labor_name: 'Light Bulb Replacement', labor_cost_cents: 2500, category: 'Body', description: 'Replace headlight or taillight bulbs', estimated_time_hours: 0.25 },
    { labor_name: 'Wiper Blade Replacement', labor_cost_cents: 1500, category: 'Body', description: 'Replace windshield wipers', estimated_time_hours: 0.25 },
    
    // Exhaust Services
    { labor_name: 'Muffler Replacement', labor_cost_cents: 18000, category: 'Exhaust', description: 'Muffler replacement', estimated_time_hours: 2.0 },
    { labor_name: 'Catalytic Converter Replacement', labor_cost_cents: 35000, category: 'Exhaust', description: 'Catalytic converter replacement', estimated_time_hours: 3.0 }
];

const seedLabor = () => {
    console.log('Seeding common automotive labor items...');
    
    // Clear existing labor data first
    const clearQuery = 'DELETE FROM labor';
    db.query(clearQuery, (err) => {
        if (err) {
            console.error('Error clearing labor table:', err);
            return;
        }
        console.log('Cleared existing labor data');
        
        // Insert labor items one by one
        let completed = 0;
        const total = laborItems.length;
        
        laborItems.forEach((item, index) => {
            const query = 'INSERT INTO labor (labor_name, labor_cost_cents, category, description, estimated_time_hours) VALUES (?, ?, ?, ?, ?)';
            
            db.query(query, [item.labor_name, item.labor_cost_cents, item.category, item.description, item.estimated_time_hours], (err, result) => {
                if (err) {
                    console.error(`Error inserting labor item ${index + 1}:`, err);
                } else {
                    completed++;
                    console.log(`✅ ${completed}/${total}: ${item.labor_name} - $${(item.labor_cost_cents / 100).toFixed(2)}`);
                }
                
                if (completed === total) {
                    console.log(`\n🎉 Successfully seeded ${total} labor items!`);
                    db.end();
                }
            });
        });
    });
};

// Connect and seed
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
    seedLabor();
});