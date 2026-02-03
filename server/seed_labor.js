const mysql = require('mysql2');
const dbConfig = require('./config/database');
require('dotenv').config();

const db = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

const HOURLY_RATE = 10000; // $100.00 per hour in cents

// Comprehensive labor items with estimated repair times
const laborItems = [
    // OIL & FLUID SERVICES
    { name: 'Oil Change - Standard', hours: 0.5, category: 'Maintenance', description: 'Oil and filter change, fluid top-off, basic inspection' },
    { name: 'Oil Change - Synthetic', hours: 0.5, category: 'Maintenance', description: 'Synthetic oil and filter change, fluid top-off, inspection' },
    { name: 'Transmission Fluid Change', hours: 1.0, category: 'Transmission', description: 'Drain and fill transmission fluid' },
    { name: 'Transmission Flush & Fill', hours: 1.5, category: 'Transmission', description: 'Complete transmission flush with new fluid' },
    { name: 'Coolant Flush', hours: 1.0, category: 'Cooling', description: 'Complete cooling system flush and refill' },
    { name: 'Power Steering Fluid Change', hours: 0.5, category: 'Maintenance', description: 'Power steering fluid exchange' },
    { name: 'Differential Fluid Change', hours: 0.75, category: 'Drivetrain', description: 'Rear or front differential fluid service' },
    { name: 'Transfer Case Fluid Change', hours: 0.75, category: 'Drivetrain', description: '4WD/AWD transfer case fluid service' },
    
    // BRAKE SERVICES
    { name: 'Brake Pads Replacement - Front', hours: 1.5, category: 'Brakes', description: 'Replace front brake pads, resurface rotors if needed' },
    { name: 'Brake Pads Replacement - Rear', hours: 1.5, category: 'Brakes', description: 'Replace rear brake pads, resurface rotors if needed' },
    { name: 'Brake Pads & Rotors - Front', hours: 2.0, category: 'Brakes', description: 'Replace front brake pads and rotors' },
    { name: 'Brake Pads & Rotors - Rear', hours: 2.0, category: 'Brakes', description: 'Replace rear brake pads and rotors' },
    { name: 'Brake Pads & Rotors - All Four', hours: 3.5, category: 'Brakes', description: 'Complete brake job, all four wheels' },
    { name: 'Brake Fluid Flush', hours: 1.0, category: 'Brakes', description: 'Complete brake system fluid flush' },
    { name: 'Brake Caliper Replacement', hours: 1.5, category: 'Brakes', description: 'Replace brake caliper (per wheel)' },
    { name: 'Brake Line Repair', hours: 1.0, category: 'Brakes', description: 'Repair or replace brake line' },
    { name: 'Emergency Brake Adjustment', hours: 0.5, category: 'Brakes', description: 'Adjust parking brake tension' },
    { name: 'Brake Shoe Replacement', hours: 2.5, category: 'Brakes', description: 'Replace rear drum brake shoes' },
    
    // TIRE SERVICES
    { name: 'Tire Rotation', hours: 0.5, category: 'Tires', description: 'Rotate all four tires, check pressure' },
    { name: 'Tire Mount & Balance - Per Tire', hours: 0.25, category: 'Tires', description: 'Mount and balance one tire' },
    { name: 'Tire Mount & Balance - Set of 4', hours: 1.0, category: 'Tires', description: 'Mount and balance four tires' },
    { name: 'Tire Repair - Flat', hours: 0.5, category: 'Tires', description: 'Patch or plug tire puncture' },
    { name: 'Wheel Alignment - 2 Wheel', hours: 1.0, category: 'Suspension', description: 'Front wheel alignment' },
    { name: 'Wheel Alignment - 4 Wheel', hours: 1.5, category: 'Suspension', description: 'Four wheel alignment' },
    { name: 'TPMS Sensor Replacement', hours: 0.5, category: 'Tires', description: 'Replace tire pressure monitor sensor' },
    { name: 'TPMS Reset & Programming', hours: 0.25, category: 'Tires', description: 'Reset and program TPMS system' },
    
    // SUSPENSION SERVICES
    { name: 'Shock Absorber Replacement - Front (Pair)', hours: 2.0, category: 'Suspension', description: 'Replace front shock absorbers' },
    { name: 'Shock Absorber Replacement - Rear (Pair)', hours: 2.0, category: 'Suspension', description: 'Replace rear shock absorbers' },
    { name: 'Strut Assembly Replacement - Front (Pair)', hours: 3.0, category: 'Suspension', description: 'Replace front strut assemblies' },
    { name: 'Strut Assembly Replacement - Rear (Pair)', hours: 3.0, category: 'Suspension', description: 'Replace rear strut assemblies' },
    { name: 'Ball Joint Replacement - Upper', hours: 2.0, category: 'Suspension', description: 'Replace upper ball joint (per side)' },
    { name: 'Ball Joint Replacement - Lower', hours: 2.5, category: 'Suspension', description: 'Replace lower ball joint (per side)' },
    { name: 'Tie Rod End Replacement - Inner', hours: 1.5, category: 'Suspension', description: 'Replace inner tie rod end' },
    { name: 'Tie Rod End Replacement - Outer', hours: 1.0, category: 'Suspension', description: 'Replace outer tie rod end' },
    { name: 'Control Arm Replacement', hours: 2.0, category: 'Suspension', description: 'Replace control arm (per side)' },
    { name: 'Sway Bar Link Replacement', hours: 0.75, category: 'Suspension', description: 'Replace sway bar end link' },
    { name: 'Wheel Bearing Replacement - Front', hours: 2.5, category: 'Suspension', description: 'Replace front wheel bearing hub' },
    { name: 'Wheel Bearing Replacement - Rear', hours: 2.5, category: 'Suspension', description: 'Replace rear wheel bearing hub' },
    
    // ENGINE SERVICES
    { name: 'Spark Plug Replacement - 4 Cylinder', hours: 1.0, category: 'Engine', description: 'Replace spark plugs (4 cyl)' },
    { name: 'Spark Plug Replacement - 6 Cylinder', hours: 1.5, category: 'Engine', description: 'Replace spark plugs (6 cyl)' },
    { name: 'Spark Plug Replacement - 8 Cylinder', hours: 2.0, category: 'Engine', description: 'Replace spark plugs (8 cyl)' },
    { name: 'Ignition Coil Replacement', hours: 0.75, category: 'Engine', description: 'Replace ignition coil (per coil)' },
    { name: 'Serpentine Belt Replacement', hours: 0.75, category: 'Engine', description: 'Replace accessory drive belt' },
    { name: 'Timing Belt Replacement', hours: 5.0, category: 'Engine', description: 'Replace timing belt and tensioners' },
    { name: 'Timing Chain Replacement', hours: 8.0, category: 'Engine', description: 'Replace timing chain and guides' },
    { name: 'Water Pump Replacement', hours: 3.0, category: 'Cooling', description: 'Replace water pump' },
    { name: 'Thermostat Replacement', hours: 1.0, category: 'Cooling', description: 'Replace engine thermostat' },
    { name: 'Radiator Replacement', hours: 2.5, category: 'Cooling', description: 'Replace radiator' },
    { name: 'Radiator Hose Replacement', hours: 0.5, category: 'Cooling', description: 'Replace upper or lower radiator hose' },
    { name: 'Air Filter Replacement', hours: 0.25, category: 'Maintenance', description: 'Replace engine air filter' },
    { name: 'Cabin Air Filter Replacement', hours: 0.25, category: 'Maintenance', description: 'Replace cabin air filter' },
    { name: 'Fuel Filter Replacement', hours: 0.75, category: 'Fuel', description: 'Replace inline fuel filter' },
    { name: 'Fuel Pump Replacement', hours: 3.0, category: 'Fuel', description: 'Replace electric fuel pump' },
    { name: 'Fuel Injector Service', hours: 2.0, category: 'Fuel', description: 'Clean or replace fuel injectors' },
    { name: 'Throttle Body Cleaning', hours: 1.0, category: 'Engine', description: 'Clean throttle body and intake' },
    { name: 'Mass Air Flow Sensor Cleaning', hours: 0.5, category: 'Engine', description: 'Clean MAF sensor' },
    { name: 'PCV Valve Replacement', hours: 0.5, category: 'Engine', description: 'Replace PCV valve' },
    { name: 'Valve Cover Gasket Replacement', hours: 2.5, category: 'Engine', description: 'Replace valve cover gasket(s)' },
    { name: 'Oil Pan Gasket Replacement', hours: 4.0, category: 'Engine', description: 'Replace oil pan gasket' },
    { name: 'Head Gasket Replacement', hours: 12.0, category: 'Engine', description: 'Replace cylinder head gasket' },
    
    // ELECTRICAL SERVICES
    { name: 'Battery Replacement', hours: 0.25, category: 'Electrical', description: 'Replace battery' },
    { name: 'Battery Terminal Cleaning', hours: 0.25, category: 'Electrical', description: 'Clean battery terminals and cables' },
    { name: 'Alternator Replacement', hours: 2.0, category: 'Electrical', description: 'Replace alternator' },
    { name: 'Starter Replacement', hours: 2.5, category: 'Electrical', description: 'Replace starter motor' },
    { name: 'Headlight Bulb Replacement', hours: 0.5, category: 'Electrical', description: 'Replace headlight bulb (per bulb)' },
    { name: 'Tail Light Bulb Replacement', hours: 0.25, category: 'Electrical', description: 'Replace tail light bulb' },
    { name: 'Headlight Assembly Replacement', hours: 1.0, category: 'Electrical', description: 'Replace headlight assembly' },
    { name: 'Fuse Replacement', hours: 0.25, category: 'Electrical', description: 'Diagnose and replace fuse' },
    { name: 'Wiper Blade Replacement', hours: 0.25, category: 'Maintenance', description: 'Replace wiper blades' },
    { name: 'Wiper Motor Replacement', hours: 1.5, category: 'Electrical', description: 'Replace windshield wiper motor' },
    
    // EXHAUST SERVICES
    { name: 'Muffler Replacement', hours: 1.5, category: 'Exhaust', description: 'Replace muffler' },
    { name: 'Catalytic Converter Replacement', hours: 2.5, category: 'Exhaust', description: 'Replace catalytic converter' },
    { name: 'Exhaust Pipe Repair', hours: 1.0, category: 'Exhaust', description: 'Repair or replace exhaust pipe section' },
    { name: 'Oxygen Sensor Replacement', hours: 1.0, category: 'Exhaust', description: 'Replace O2 sensor' },
    { name: 'Exhaust Manifold Gasket', hours: 3.0, category: 'Exhaust', description: 'Replace exhaust manifold gasket' },
    
    // TRANSMISSION SERVICES
    { name: 'Clutch Replacement', hours: 6.0, category: 'Transmission', description: 'Replace clutch disc, pressure plate, throwout bearing' },
    { name: 'Transmission Rebuild', hours: 16.0, category: 'Transmission', description: 'Complete transmission rebuild' },
    { name: 'Transmission Removal & Installation', hours: 8.0, category: 'Transmission', description: 'R&R transmission' },
    { name: 'CV Axle Replacement', hours: 2.0, category: 'Drivetrain', description: 'Replace CV axle shaft' },
    { name: 'U-Joint Replacement', hours: 2.0, category: 'Drivetrain', description: 'Replace driveshaft U-joint' },
    
    // A/C SERVICES
    { name: 'A/C Recharge', hours: 1.0, category: 'A/C', description: 'Evacuate and recharge A/C system' },
    { name: 'A/C Compressor Replacement', hours: 3.5, category: 'A/C', description: 'Replace A/C compressor' },
    { name: 'A/C Condenser Replacement', hours: 2.5, category: 'A/C', description: 'Replace A/C condenser' },
    { name: 'A/C Evaporator Replacement', hours: 6.0, category: 'A/C', description: 'Replace A/C evaporator core' },
    { name: 'Heater Core Replacement', hours: 6.0, category: 'Cooling', description: 'Replace heater core' },
    { name: 'Blower Motor Replacement', hours: 1.5, category: 'A/C', description: 'Replace blower motor' },
    
    // DIAGNOSTIC SERVICES
    { name: 'Computer Diagnostic Scan', hours: 0.5, category: 'Diagnostic', description: 'OBD-II diagnostic scan and code reading' },
    { name: 'Electrical System Diagnosis', hours: 1.0, category: 'Diagnostic', description: 'Diagnose electrical system issue' },
    { name: 'Engine Performance Diagnosis', hours: 1.5, category: 'Diagnostic', description: 'Diagnose engine performance problem' },
    { name: 'Transmission Diagnosis', hours: 1.0, category: 'Diagnostic', description: 'Diagnose transmission issue' },
    { name: 'A/C System Diagnosis', hours: 1.0, category: 'Diagnostic', description: 'Diagnose A/C system problem' },
    { name: 'Noise Diagnosis', hours: 1.0, category: 'Diagnostic', description: 'Diagnose unusual noise source' },
    { name: 'Pre-Purchase Inspection', hours: 2.0, category: 'Diagnostic', description: 'Comprehensive pre-purchase vehicle inspection' },
    { name: 'State Inspection', hours: 0.75, category: 'Diagnostic', description: 'State safety and emissions inspection' },
    
    // SPECIALTY SERVICES
    { name: 'Windshield Wiper Linkage Repair', hours: 1.5, category: 'Maintenance', description: 'Repair wiper linkage assembly' },
    { name: 'Door Lock Actuator Replacement', hours: 1.5, category: 'Electrical', description: 'Replace door lock actuator' },
    { name: 'Window Regulator Replacement', hours: 2.0, category: 'Electrical', description: 'Replace power window regulator' },
    { name: 'Mirror Replacement', hours: 0.75, category: 'Body', description: 'Replace side mirror assembly' },
    { name: 'Horn Replacement', hours: 0.5, category: 'Electrical', description: 'Replace horn' },
    { name: 'Coolant Leak Diagnosis', hours: 1.0, category: 'Diagnostic', description: 'Pressure test and diagnose coolant leak' },
    { name: 'Oil Leak Diagnosis', hours: 1.0, category: 'Diagnostic', description: 'Diagnose engine oil leak source' },
    { name: 'Smoke Test - Evap System', hours: 1.0, category: 'Diagnostic', description: 'Smoke test for evaporative emission leaks' },
    
    // FLEET & COMMERCIAL
    { name: 'Multi-Point Inspection', hours: 0.5, category: 'Maintenance', description: 'Comprehensive vehicle health inspection' },
    { name: 'Fleet Service - Oil Change Package', hours: 0.75, category: 'Maintenance', description: 'Oil change plus full inspection for fleet vehicles' },
    { name: 'Courtesy Check', hours: 0.25, category: 'Maintenance', description: 'Basic courtesy inspection with any service' }
];

console.log(`💼 Seeding Labor Database ($${HOURLY_RATE/100}/hr)...`);
console.log('==========================================\n');

// Calculate costs
const laborWithCosts = laborItems.map(item => ({
    ...item,
    cost_cents: Math.round(item.hours * HOURLY_RATE)
}));

console.log(`📋 Prepared ${laborWithCosts.length} labor items`);
console.log(`⏱️  Hourly Rate: $${HOURLY_RATE/100}.00`);
console.log('\n🏷️  Categories:');

const categories = [...new Set(laborWithCosts.map(l => l.category))];
categories.forEach(cat => {
    const items = laborWithCosts.filter(l => l.category === cat);
    const count = items.length;
    const totalHours = items.reduce((sum, l) => sum + l.hours, 0);
    console.log(`   • ${cat}: ${count} items (${totalHours.toFixed(1)} total hours)`);
});

console.log();

// Connect and insert
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database\n');
    
    db.query('SHOW TABLES LIKE "labor"', (err, results) => {
        if (err) {
            console.error('❌ Error checking tables:', err);
            db.end();
            return;
        }
        
        if (results.length === 0) {
            console.error('❌ Labor table does not exist!');
            console.log('Please run: node migrate.js first');
            db.end();
            return;
        }
        
        // Clear existing labor data
        console.log('🧹 Clearing existing labor data...');
        db.query('DELETE FROM labor', (err) => {
            if (err) {
                console.error('❌ Error clearing table:', err);
                db.end();
                return;
            }
            
            console.log('📥 Inserting labor items...\n');
            
            // Insert in batches
            const batchSize = 50;
            let inserted = 0;
            
            const insertBatch = (startIndex) => {
                if (startIndex >= laborWithCosts.length) {
                    console.log(`\n✅ Completed! Inserted ${inserted} labor items`);
                    
                    // Get summary stats
                    const summaryQuery = `
                        SELECT category, 
                               COUNT(*) as count,
                               MIN(labor_cost_cents) as min_cost,
                               MAX(labor_cost_cents) as max_cost,
                               AVG(labor_cost_cents) as avg_cost,
                               SUM(estimated_time_hours) as total_hours
                        FROM labor
                        GROUP BY category
                        ORDER BY category
                    `;
                    
                    db.query(summaryQuery, (err, results) => {
                        if (!err) {
                            console.log('\n📊 Labor Summary by Category:');
                            console.log('============================');
                            results.forEach(row => {
                                console.log(`\n${row.category}:`);
                                console.log(`   ${row.count} services`);
                                console.log(`   ${Number(row.total_hours).toFixed(1)} total hours`);
                                console.log(`   Cost range: $${(row.min_cost/100).toFixed(2)} - $${(row.max_cost/100).toFixed(2)}`);
                                console.log(`   Average: $${(row.avg_cost/100).toFixed(2)}`);
                            });
                        }
                        
                        db.query('SELECT COUNT(*) as total FROM labor', (err, result) => {
                            if (!err) {
                                console.log(`\n✅ Total labor items in database: ${result[0].total}`);
                            }
                            
                            console.log('\n💼 Labor database ready for professional automotive repair!');
                            console.log('==========================================================\n');
                            db.end();
                        });
                    });
                    return;
                }
                
                const batch = laborWithCosts.slice(startIndex, startIndex + batchSize);
                const values = batch.map(l => [
                    l.name,
                    l.cost_cents,
                    l.category,
                    l.description,
                    l.hours
                ]);
                
                const query = `
                    INSERT INTO labor (labor_name, labor_cost_cents, category, description, estimated_time_hours)
                    VALUES ?
                `;
                
                db.query(query, [values], (err, result) => {
                    if (err) {
                        console.error(`❌ Error inserting batch:`, err.message);
                    } else {
                        inserted += result.affectedRows;
                        process.stdout.write(`\rProgress: ${inserted}/${laborWithCosts.length} items...`);
                    }
                    insertBatch(startIndex + batchSize);
                });
            };
            
            insertBatch(0);
        });
    });
});
