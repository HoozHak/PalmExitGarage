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

const seedComprehensiveVehicles = () => {
    console.log('🚗 Seeding comprehensive vehicle reference database (2010-Present)...');
    console.log('=================================================================\n');
    
    // Comprehensive vehicle data - major makes and models from 2010-present
    const vehicles = [];
    
    // Generate years 2010-2025
    const years = [];
    for (let year = 2010; year <= 2025; year++) {
        years.push(year);
    }
    
    // Popular makes and their models
    const vehicleData = {
        'Honda': [
            'Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey', 'Fit', 'HR-V', 'Passport', 'Ridgeline',
            'Crosstour', 'Crosstour EX', 'Crosstour EX-L', 'Crosstour EX-L V6', // Honda Crosstour variants
            'Insight', 'CR-Z', 'Element'
        ],
        'Toyota': [
            'Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna', 'Tacoma', 'Tundra',
            '4Runner', 'Sequoia', 'Yaris', 'Avalon', 'Prius V', 'Prius C', 'Venza', 'Matrix',
            'FJ Cruiser', 'Land Cruiser', 'C-HR', 'Supra', 'GR86'
        ],
        'Ford': [
            'F-150', 'Focus', 'Fusion', 'Escape', 'Explorer', 'Edge', 'Expedition', 'Mustang',
            'Fiesta', 'Taurus', 'Flex', 'Transit', 'EcoSport', 'Bronco', 'Ranger', 'Super Duty',
            'F-250', 'F-350', 'F-450', 'Maverick', 'Lightning'
        ],
        'Chevrolet': [
            'Silverado', 'Cruze', 'Malibu', 'Equinox', 'Tahoe', 'Suburban', 'Impala', 'Camaro',
            'Traverse', 'Sonic', 'Spark', 'Aveo', 'Colorado', 'Blazer', 'Trax', 'Volt',
            'Corvette', 'Silverado 1500', 'Silverado 2500HD', 'Silverado 3500HD'
        ],
        'Nissan': [
            'Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'Maxima', 'Versa', 'Frontier',
            'Titan', 'Armada', 'Juke', 'Cube', 'Leaf', '370Z', 'GT-R', 'NV200', 'Kicks',
            'Rogue Sport', 'Ariya'
        ],
        'Hyundai': [
            'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Genesis', 'Veloster', 'Azera',
            'Equus', 'Santa Fe Sport', 'Ioniq', 'Kona', 'Palisade', 'Venue', 'Nexo',
            'Genesis G80', 'Genesis G90'
        ],
        'Kia': [
            'Optima', 'Forte', 'Sorento', 'Sportage', 'Rio', 'Soul', 'Sedona', 'Cadenza',
            'Stinger', 'Niro', 'Telluride', 'Seltos', 'K5', 'Carnival', 'EV6', 'Borrego'
        ],
        'Subaru': [
            'Outback', 'Forester', 'Impreza', 'Legacy', 'Crosstrek', 'WRX', 'WRX STI', 'Tribeca',
            'BRZ', 'Ascent', 'XV Crosstrek', 'Baja'
        ],
        'Mazda': [
            'Mazda3', 'Mazda6', 'CX-5', 'CX-9', 'Mazda2', 'MX-5 Miata', 'CX-3', 'CX-30',
            'CX-50', 'MX-30', 'Tribute', 'CX-7', 'RX-8'
        ],
        'Volkswagen': [
            'Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Beetle', 'CC', 'Touareg',
            'Routan', 'Eos', 'GTI', 'Golf R', 'Arteon', 'ID.4', 'Taos'
        ],
        'BMW': [
            '3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X1', 'X6', '1 Series', '2 Series',
            '4 Series', '6 Series', '8 Series', 'X2', 'X4', 'X7', 'Z4', 'i3', 'i4', 'iX'
        ],
        'Mercedes-Benz': [
            'C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLA', 'GLB', 'GLS', 'CLA',
            'A-Class', 'G-Class', 'SL', 'AMG GT', 'EQS', 'EQC', 'Sprinter', 'Metris'
        ],
        'Audi': [
            'A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'A5', 'S3', 'S4',
            'S5', 'S6', 'S8', 'RS3', 'RS4', 'RS5', 'RS6', 'RS7', 'e-tron', 'Q4 e-tron'
        ],
        'Lexus': [
            'ES', 'IS', 'GS', 'LS', 'RX', 'GX', 'LX', 'NX', 'UX', 'CT', 'SC', 'RC',
            'LC', 'LFA', 'HS'
        ],
        'Acura': [
            'TLX', 'ILX', 'RDX', 'MDX', 'TL', 'TSX', 'RL', 'ZDX', 'RLX', 'NSX', 'CDX',
            'Integra', 'Type S'
        ],
        'Infiniti': [
            'G25', 'G35', 'G37', 'Q50', 'Q60', 'QX50', 'QX60', 'QX70', 'QX80', 'M35', 'M37',
            'M45', 'M56', 'FX35', 'FX37', 'FX50', 'JX35', 'Q70', 'QX30'
        ],
        'Jeep': [
            'Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Patriot', 'Renegade',
            'Commander', 'Liberty', 'Gladiator', 'Wagoneer', 'Grand Wagoneer'
        ],
        'Dodge': [
            'Charger', 'Challenger', 'Durango', 'Journey', 'Avenger', 'Dart', 'Caravan',
            'Grand Caravan', 'Viper', 'Ram 1500', 'Ram 2500', 'Ram 3500', 'Hornet'
        ],
        'Chrysler': [
            '300', 'Town & Country', 'Sebring', '200', 'Pacifica', 'Voyager', 'PT Cruiser',
            'Aspen', 'Crossfire'
        ],
        'Cadillac': [
            'CTS', 'ATS', 'XTS', 'CT6', 'Escalade', 'SRX', 'XT5', 'XT4', 'XT6', 'CT4', 'CT5',
            'DTS', 'STS', 'DeVille', 'ELR', 'Lyriq'
        ],
        'Buick': [
            'LaCrosse', 'Regal', 'Enclave', 'Encore', 'Verano', 'Lucerne', 'Envision',
            'Cascada', 'Envista'
        ],
        'GMC': [
            'Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon', 'Savana', 'Sierra 1500',
            'Sierra 2500HD', 'Sierra 3500HD', 'Hummer EV'
        ],
        'Lincoln': [
            'MKZ', 'MKS', 'MKX', 'Navigator', 'MKT', 'MKC', 'Continental', 'Corsair',
            'Nautilus', 'Aviator', 'Town Car'
        ],
        'Volvo': [
            'S60', 'S80', 'S90', 'V60', 'V90', 'XC60', 'XC70', 'XC90', 'C30', 'C70',
            'V70', 'XC40', 'Polestar'
        ],
        'Mitsubishi': [
            'Lancer', 'Outlander', 'Eclipse', 'Galant', 'Endeavor', 'Outlander Sport',
            'Mirage', 'Eclipse Cross', 'i-MiEV', 'Montero Sport'
        ],
        'Genesis': [
            'G80', 'G90', 'GV70', 'GV80', 'Coupe', 'Sedan'
        ],
        'Tesla': [
            'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'
        ]
    };
    
    // Generate vehicle combinations
    Object.entries(vehicleData).forEach(([make, models]) => {
        models.forEach(model => {
            years.forEach(year => {
                // Skip Honda Crosstour after 2015 (discontinued)
                if (make === 'Honda' && model.includes('Crosstour') && year > 2015) {
                    return;
                }
                
                // Skip some discontinued models
                const discontinuedModels = {
                    'Honda': { 'Element': 2011, 'CR-Z': 2016, 'Insight': 2014 },
                    'Toyota': { 'Matrix': 2014, 'FJ Cruiser': 2014, 'Prius V': 2017, 'Prius C': 2019, 'Venza': 2015 },
                    'Ford': { 'Focus': 2018, 'Fiesta': 2019, 'Taurus': 2019, 'Flex': 2019 },
                    'Chevrolet': { 'Cruze': 2019, 'Impala': 2020, 'Sonic': 2020, 'Volt': 2019 },
                    'Nissan': { 'Cube': 2014, '370Z': 2020 },
                };
                
                if (discontinuedModels[make] && discontinuedModels[make][model] && year > discontinuedModels[make][model]) {
                    return;
                }
                
                vehicles.push({
                    year: year,
                    make: make,
                    model: model
                });
            });
        });
    });
    
    console.log(`📊 Generated ${vehicles.length} vehicle combinations`);
    console.log(`📅 Years: ${Math.min(...years)} - ${Math.max(...years)}`);
    console.log(`🏭 Makes: ${Object.keys(vehicleData).length}`);
    console.log('✅ Honda Crosstour models included (2010-2015)\n');
    
    // Insert vehicles in batches to avoid overwhelming the database
    const batchSize = 1000;
    let currentBatch = 0;
    
    const insertBatch = (startIndex) => {
        const endIndex = Math.min(startIndex + batchSize, vehicles.length);
        const batch = vehicles.slice(startIndex, endIndex);
        
        if (batch.length === 0) {
            console.log('\n🎉 Vehicle reference database seeding complete!');
            console.log('================================================');
            
            // Get final counts
            db.query('SELECT COUNT(*) as total FROM vehicle_reference', (err, result) => {
                if (!err) {
                    console.log(`📊 Total vehicles in database: ${result[0].total}`);
                }
                
                // Check Honda Crosstour specifically
                db.query('SELECT COUNT(*) as count FROM vehicle_reference WHERE make = "Honda" AND model LIKE "%Crosstour%"', (err, result) => {
                    if (!err) {
                        console.log(`🏎️  Honda Crosstour models: ${result[0].count}`);
                    }
                    
                    console.log('\n✨ Ready to use in your vehicle selection forms!');
                    db.end();
                });
            });
            return;
        }
        
        const query = 'INSERT INTO vehicle_reference (year, make, model) VALUES ? ON DUPLICATE KEY UPDATE make = VALUES(make)';
        const values = batch.map(v => [v.year, v.make, v.model]);
        
        db.query(query, [values], (err, result) => {
            if (err) {
                console.error(`❌ Error inserting batch ${currentBatch + 1}:`, err.message);
                return;
            }
            
            currentBatch++;
            const progress = Math.round((endIndex / vehicles.length) * 100);
            console.log(`✅ Batch ${currentBatch} completed (${endIndex}/${vehicles.length} - ${progress}%)`);
            
            // Insert next batch
            setTimeout(() => insertBatch(endIndex), 100); // Small delay to avoid overwhelming DB
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
    seedComprehensiveVehicles();
});