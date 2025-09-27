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

const seedAutoZoneParts = () => {
    console.log('🔧 Seeding AutoZone Business Parts Database...');
    console.log('===============================================\n');
    
    // Comprehensive parts data based on AutoZone business pricing
    const parts = [
        // ENGINE COMPONENTS
        { brand: 'ACDelco', item: 'Professional Oil Filter', part_number: 'PF457G', cost_cents: 899, category: 'Engine', description: 'Premium oil filter for GM vehicles' },
        { brand: 'ACDelco', item: 'Professional Oil Filter', part_number: 'PF46E', cost_cents: 799, category: 'Engine', description: 'Premium oil filter for GM vehicles' },
        { brand: 'ACDelco', item: 'Professional Oil Filter', part_number: 'PF48E', cost_cents: 849, category: 'Engine', description: 'Premium oil filter for GM vehicles' },
        { brand: 'Fram', item: 'Extra Guard Oil Filter', part_number: 'PH3593A', cost_cents: 649, category: 'Engine', description: 'Standard oil filter' },
        { brand: 'Fram', item: 'Extra Guard Oil Filter', part_number: 'PH16', cost_cents: 599, category: 'Engine', description: 'Standard oil filter' },
        { brand: 'Fram', item: 'Tough Guard Oil Filter', part_number: 'TG16', cost_cents: 899, category: 'Engine', description: 'Heavy duty oil filter' },
        { brand: 'Mobil 1', item: 'Extended Performance Oil Filter', part_number: 'M1-110A', cost_cents: 1199, category: 'Engine', description: 'Synthetic oil filter' },
        { brand: 'Bosch', item: 'Workshop Air Filter', part_number: '5544WS', cost_cents: 1299, category: 'Engine', description: 'High-quality air filter' },
        { brand: 'Bosch', item: 'Workshop Air Filter', part_number: '5579WS', cost_cents: 1199, category: 'Engine', description: 'High-quality air filter' },
        { brand: 'K&N', item: 'High-Flow Air Filter', part_number: '33-2304', cost_cents: 4999, category: 'Engine', description: 'Washable performance air filter' },
        { brand: 'Mann-Filter', item: 'Air Filter', part_number: 'C3698/3', cost_cents: 1599, category: 'Engine', description: 'OEM quality air filter' },
        { brand: 'STP', item: 'Engine Fuel Injector Cleaner', part_number: '78568', cost_cents: 499, category: 'Engine', description: '12 fl oz fuel system cleaner' },
        
        // SPARK PLUGS & IGNITION
        { brand: 'NGK', item: 'Laser Iridium Spark Plugs', part_number: 'IZFR6K11', cost_cents: 1299, category: 'Engine', description: 'Iridium spark plug (single)' },
        { brand: 'NGK', item: 'V-Power Spark Plugs', part_number: 'TR5', cost_cents: 349, category: 'Engine', description: 'Copper core spark plug (single)' },
        { brand: 'Champion', item: 'Copper Plus Spark Plugs', part_number: 'RC12ECC', cost_cents: 249, category: 'Engine', description: 'Standard copper spark plug' },
        { brand: 'Denso', item: 'Iridium TT Spark Plugs', part_number: 'IK20TT', cost_cents: 899, category: 'Engine', description: 'Twin tip iridium spark plug' },
        { brand: 'Denso', item: 'Platinum TT Spark Plugs', part_number: 'PK20TT', cost_cents: 599, category: 'Engine', description: 'Twin tip platinum spark plug' },
        { brand: 'Bosch', item: 'Double Platinum Spark Plugs', part_number: '4417', cost_cents: 449, category: 'Engine', description: 'Platinum spark plug' },
        { brand: 'MSD', item: 'Ignition Coil', part_number: '8261', cost_cents: 8999, category: 'Engine', description: 'High performance ignition coil' },
        
        // BELTS & HOSES
        { brand: 'Gates', item: 'Serpentine Belt', part_number: 'K060965', cost_cents: 1899, category: 'Engine', description: 'Micro-V belt for accessory drive' },
        { brand: 'Gates', item: 'Serpentine Belt', part_number: 'K061030', cost_cents: 2199, category: 'Engine', description: 'Heavy duty serpentine belt' },
        { brand: 'Dayco', item: 'Serpentine Belt', part_number: '5060965', cost_cents: 1699, category: 'Engine', description: 'Premium serpentine belt' },
        { brand: 'Continental', item: 'Elite Serpentine Belt', part_number: '4060965', cost_cents: 2399, category: 'Engine', description: 'Long-life serpentine belt' },
        { brand: 'Gates', item: 'Radiator Hose - Upper', part_number: '21579', cost_cents: 2299, category: 'Cooling', description: 'Molded radiator hose' },
        { brand: 'Gates', item: 'Radiator Hose - Lower', part_number: '21580', cost_cents: 2499, category: 'Cooling', description: 'Molded radiator hose' },
        
        // BRAKE COMPONENTS
        { brand: 'Wagner', item: 'ThermoQuiet Brake Pads - Front', part_number: 'ZD465', cost_cents: 4599, category: 'Brakes', description: 'Ceramic brake pads, front set' },
        { brand: 'Wagner', item: 'ThermoQuiet Brake Pads - Rear', part_number: 'ZD466', cost_cents: 3899, category: 'Brakes', description: 'Ceramic brake pads, rear set' },
        { brand: 'Wagner', item: 'SevereDuty Brake Pads - Front', part_number: 'ZX465', cost_cents: 3999, category: 'Brakes', description: 'Semi-metallic brake pads' },
        { brand: 'Raybestos', item: 'Professional Grade Brake Pads', part_number: 'MGD465CH', cost_cents: 5299, category: 'Brakes', description: 'Premium ceramic brake pads' },
        { brand: 'AC Delco', item: 'Professional Brake Pads', part_number: '17D465CH', cost_cents: 4899, category: 'Brakes', description: 'OEM quality brake pads' },
        { brand: 'Centric', item: 'Premium Brake Rotor', part_number: '120.44129', cost_cents: 5999, category: 'Brakes', description: 'Front brake rotor (single)' },
        { brand: 'Raybestos', item: 'Professional Grade Rotor', part_number: '96129R', cost_cents: 6799, category: 'Brakes', description: 'Premium brake rotor' },
        { brand: 'Wagner', item: 'Brake Rotor', part_number: 'BD44129', cost_cents: 4499, category: 'Brakes', description: 'Standard brake rotor' },
        { brand: 'Bendix', item: 'Premium Brake Fluid', part_number: 'PBF-1', cost_cents: 799, category: 'Brakes', description: 'DOT 3 brake fluid, 12 oz' },
        { brand: 'Prestone', item: 'DOT 3 Brake Fluid', part_number: 'AS400', cost_cents: 599, category: 'Brakes', description: 'Standard brake fluid, 12 oz' },
        
        // SUSPENSION COMPONENTS
        { brand: 'Monroe', item: 'Gas-Magnum Shock Absorber', part_number: '71339', cost_cents: 6799, category: 'Suspension', description: 'Gas-charged shock absorber' },
        { brand: 'Monroe', item: 'OESpectrum Strut', part_number: '71340', cost_cents: 12999, category: 'Suspension', description: 'Complete strut assembly' },
        { brand: 'Gabriel', item: 'Ultra Shock Absorber', part_number: 'G56789', cost_cents: 5999, category: 'Suspension', description: 'Heavy duty shock absorber' },
        { brand: 'KYB', item: 'Gas-a-Just Shock', part_number: 'KG5456', cost_cents: 7999, category: 'Suspension', description: 'Monotube shock absorber' },
        { brand: 'Moog', item: 'Ball Joint', part_number: 'K80145', cost_cents: 3999, category: 'Suspension', description: 'Premium ball joint' },
        { brand: 'Moog', item: 'Tie Rod End', part_number: 'ES3479', cost_cents: 2899, category: 'Suspension', description: 'Inner tie rod end' },
        
        // FLUIDS & CHEMICALS
        { brand: 'Valvoline', item: 'MaxLife Motor Oil 5W-30', part_number: 'VV966', cost_cents: 2499, category: 'Fluids', description: '5 quart jug high mileage oil' },
        { brand: 'Valvoline', item: 'Full Synthetic Oil 5W-30', part_number: 'VV967', cost_cents: 2899, category: 'Fluids', description: '5 quart jug full synthetic' },
        { brand: 'Mobil 1', item: 'Full Synthetic Oil 5W-30', part_number: 'M1-5W30-5Q', cost_cents: 3199, category: 'Fluids', description: '5 quart jug premium synthetic' },
        { brand: 'Castrol', item: 'GTX High Mileage Oil 5W-30', part_number: 'GTX-5W30-5Q', cost_cents: 2599, category: 'Fluids', description: '5 quart jug high mileage' },
        { brand: 'Shell', item: 'Rotella T6 5W-40', part_number: 'T6-5W40-5Q', cost_cents: 3999, category: 'Fluids', description: '5 quart jug diesel oil' },
        { brand: 'Mobil 1', item: 'ATF Multi-Vehicle', part_number: 'ATF320', cost_cents: 899, category: 'Fluids', description: 'Full synthetic ATF, 1 quart' },
        { brand: 'Valvoline', item: 'MaxLife ATF', part_number: 'VV324', cost_cents: 799, category: 'Fluids', description: 'High mileage ATF, 1 quart' },
        { brand: 'Prestone', item: 'DEX-COOL Antifreeze', part_number: 'AF850', cost_cents: 1299, category: 'Fluids', description: 'Extended life coolant, 1 gallon' },
        { brand: 'Zerex', item: 'G-05 Antifreeze', part_number: 'ZXG05', cost_cents: 1199, category: 'Fluids', description: 'Hybrid organic coolant' },
        
        // ELECTRICAL COMPONENTS
        { brand: 'Interstate', item: 'Mega-Tron Plus Battery', part_number: 'MTP-94R', cost_cents: 12999, category: 'Electrical', description: '650 CCA maintenance-free battery' },
        { brand: 'Interstate', item: 'Mega-Tron Plus Battery', part_number: 'MTP-24F', cost_cents: 11999, category: 'Electrical', description: '600 CCA maintenance-free battery' },
        { brand: 'DieHard', item: 'Gold Battery', part_number: 'DH-94R', cost_cents: 14999, category: 'Electrical', description: '750 CCA premium battery' },
        { brand: 'Optima', item: 'RedTop Battery', part_number: '34/78', cost_cents: 21999, category: 'Electrical', description: 'AGM starting battery' },
        { brand: 'Duralast', item: 'Gold Battery', part_number: 'DL-94R-G', cost_cents: 13999, category: 'Electrical', description: '700 CCA premium battery' },
        { brand: 'Bosch', item: 'Alternator', part_number: 'AL0834X', cost_cents: 18999, category: 'Electrical', description: 'Remanufactured alternator' },
        { brand: 'Duralast', item: 'Starter', part_number: 'DLS17734', cost_cents: 15999, category: 'Electrical', description: 'Remanufactured starter' },
        
        // FILTERS
        { brand: 'Bosch', item: 'HEPA Cabin Air Filter', part_number: 'P3875', cost_cents: 1999, category: 'Filter', description: 'Premium cabin air filter' },
        { brand: 'Beck Arnley', item: 'Cabin Air Filter', part_number: '042-2108', cost_cents: 1299, category: 'Filter', description: 'Standard cabin air filter' },
        { brand: 'Fram', item: 'Fresh Breeze Cabin Filter', part_number: 'CF10134', cost_cents: 899, category: 'Filter', description: 'Basic cabin air filter' },
        { brand: 'WIX', item: 'Fuel Filter', part_number: '33333', cost_cents: 1599, category: 'Filter', description: 'Inline fuel filter' },
        { brand: 'ACDelco', item: 'Professional Fuel Filter', part_number: 'GF652F', cost_cents: 1799, category: 'Filter', description: 'OEM quality fuel filter' },
        
        // MAINTENANCE ITEMS
        { brand: 'STP', item: 'Oil Treatment', part_number: '78374', cost_cents: 399, category: 'Maintenance', description: '15 oz oil additive' },
        { brand: 'Lucas', item: 'Engine Oil Stop Leak', part_number: '10278', cost_cents: 799, category: 'Maintenance', description: '1 quart stop leak additive' },
        { brand: 'Bar\'s Leaks', item: 'Radiator Stop Leak', part_number: '1196', cost_cents: 699, category: 'Maintenance', description: '11 oz cooling system sealer' },
        { brand: 'CRC', item: 'Mass Air Flow Sensor Cleaner', part_number: '05110', cost_cents: 899, category: 'Maintenance', description: '11 oz aerosol cleaner' },
        { brand: 'Gumout', item: 'Fuel Injector Cleaner', part_number: '510013', cost_cents: 599, category: 'Maintenance', description: '6 oz fuel system treatment' },
        
        // WIPER BLADES
        { brand: 'Bosch', item: 'ICON Wiper Blade', part_number: '22A', cost_cents: 2999, category: 'Maintenance', description: '22" premium wiper blade' },
        { brand: 'Bosch', item: 'ICON Wiper Blade', part_number: '24A', cost_cents: 3199, category: 'Maintenance', description: '24" premium wiper blade' },
        { brand: 'Rain-X', item: 'Latitude Wiper Blade', part_number: '5079278', cost_cents: 1999, category: 'Maintenance', description: '22" beam wiper blade' },
        { brand: 'Valvoline', item: 'All Season Wiper Blade', part_number: '22-1', cost_cents: 1299, category: 'Maintenance', description: '22" conventional wiper' },
        
        // SPECIALTY TOOLS & PARTS
        { brand: 'Lisle', item: 'Oil Filter Wrench', part_number: '63600', cost_cents: 1899, category: 'Tools', description: 'Professional oil filter wrench' },
        { brand: 'OTC', item: 'Ball Joint Separator', part_number: '7315A', cost_cents: 4999, category: 'Tools', description: 'Heavy duty separator tool' },
        { brand: 'Dorman', item: 'Oil Drain Plug', part_number: '090-033', cost_cents: 399, category: 'Hardware', description: 'Standard oil drain plug' },
        { brand: 'Dorman', item: 'Radiator Cap', part_number: '902-5101', cost_cents: 899, category: 'Cooling', description: '16 PSI radiator cap' },
        
        // TRANSMISSION COMPONENTS
        { brand: 'ATP', item: 'Transmission Filter Kit', part_number: 'B-233', cost_cents: 2999, category: 'Transmission', description: 'Complete filter and gasket kit' },
        { brand: 'Fel-Pro', item: 'Transmission Pan Gasket', part_number: 'TOS18640', cost_cents: 899, category: 'Transmission', description: 'OEM quality gasket' },
        { brand: 'Lucas', item: 'Transmission Fix', part_number: '10009', cost_cents: 1299, category: 'Transmission', description: '24 oz transmission additive' }
    ];
    
    console.log(`📦 Prepared ${parts.length} AutoZone business parts`);
    console.log('🏷️  Categories included:');
    const categories = [...new Set(parts.map(p => p.category))];
    categories.forEach(cat => {
        const count = parts.filter(p => p.category === cat).length;
        console.log(`   • ${cat}: ${count} parts`);
    });
    console.log();
    
    // Insert parts in batches
    const batchSize = 50;
    let currentBatch = 0;
    
    const insertBatch = (startIndex) => {
        const endIndex = Math.min(startIndex + batchSize, parts.length);
        const batch = parts.slice(startIndex, endIndex);
        
        if (batch.length === 0) {
            console.log('\n🎉 AutoZone Parts Database Seeding Complete!');
            console.log('=============================================');
            
            // Get final counts by category
            const categoryQuery = `
                SELECT category, COUNT(*) as count, 
                       MIN(cost_cents) as min_price, 
                       MAX(cost_cents) as max_price,
                       AVG(cost_cents) as avg_price
                FROM parts 
                GROUP BY category 
                ORDER BY category
            `;
            
            db.query(categoryQuery, (err, results) => {
                if (!err) {
                    console.log('\n📊 Parts Summary by Category:');
                    console.log('============================');
                    results.forEach(row => {
                        console.log(`${row.category}: ${row.count} parts`);
                        console.log(`   Price range: $${(row.min_price/100).toFixed(2)} - $${(row.max_price/100).toFixed(2)} (avg: $${(row.avg_price/100).toFixed(2)})`);
                    });
                }
                
                // Get total count
                db.query('SELECT COUNT(*) as total FROM parts', (err, result) => {
                    if (!err) {
                        console.log(`\n✅ Total parts in database: ${result[0].total}`);
                    }
                    
                    console.log('\n💼 Ready for professional automotive repair operations!');
                    db.end();
                });
            });
            return;
        }
        
        const query = `
            INSERT INTO parts (brand, item, part_number, cost_cents, category, description, in_stock) 
            VALUES ? 
            ON DUPLICATE KEY UPDATE 
                cost_cents = VALUES(cost_cents), 
                description = VALUES(description),
                in_stock = VALUES(in_stock)
        `;
        
        const values = batch.map(p => [
            p.brand, 
            p.item, 
            p.part_number, 
            p.cost_cents, 
            p.category, 
            p.description, 
            true
        ]);
        
        db.query(query, [values], (err, result) => {
            if (err) {
                console.error(`❌ Error inserting batch ${currentBatch + 1}:`, err.message);
                return;
            }
            
            currentBatch++;
            const progress = Math.round((endIndex / parts.length) * 100);
            console.log(`✅ Batch ${currentBatch} completed (${endIndex}/${parts.length} - ${progress}%)`);
            
            // Insert next batch
            setTimeout(() => insertBatch(endIndex), 50);
        });
    };
    
    // Start inserting batches
    insertBatch(0);
};

// Connect and seed
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL database\n');
    seedAutoZoneParts();
});