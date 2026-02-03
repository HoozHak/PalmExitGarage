const mysql = require('mysql2');
const dbConfig = require('./config/database');

const db = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

// Popular makes and their models for 2010-2025
const vehicleData = {
    Honda: {
        models: ['Accord', 'Civic', 'CR-V', 'Crosstour', 'Fit', 'Pilot', 'Odyssey', 'Ridgeline', 'HR-V', 'Passport', 'Insight', 'CR-Z', 'Clarity'],
        yearRanges: {
            'Crosstour': [2010, 2015],
            'CR-Z': [2011, 2016],
            'Insight': [2010, 2014],
            'HR-V': [2016, 2025],
            'Passport': [2019, 2025],
            'Clarity': [2017, 2021],
            'Ridgeline': [2010, 2014, 2017, 2025]
        }
    },
    Toyota: {
        models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Tacoma', 'Tundra', '4Runner', 'Sienna', 'Avalon', 'Yaris', 'Venza', 'C-HR', 'Sequoia', 'Supra', 'GR86', 'Corolla Cross', 'Crown', 'Mirai', 'bZ4X'],
        yearRanges: {
            'Venza': [2010, 2015, 2021, 2025],
            'C-HR': [2018, 2025],
            'Supra': [2020, 2025],
            'GR86': [2022, 2025],
            'Corolla Cross': [2022, 2025],
            'Crown': [2023, 2025],
            'Mirai': [2016, 2025],
            'bZ4X': [2023, 2025]
        }
    },
    Ford: {
        models: ['F-150', 'Escape', 'Fusion', 'Explorer', 'Focus', 'Edge', 'Mustang', 'Expedition', 'Fiesta', 'Taurus', 'Ranger', 'Bronco', 'Bronco Sport', 'Maverick', 'EcoSport', 'F-150 Lightning', 'Mustang Mach-E'],
        yearRanges: {
            'Fiesta': [2011, 2019],
            'Focus': [2010, 2018],
            'Taurus': [2010, 2019],
            'Fusion': [2010, 2020],
            'Ranger': [2019, 2025],
            'Bronco': [2021, 2025],
            'Bronco Sport': [2021, 2025],
            'Maverick': [2022, 2025],
            'EcoSport': [2018, 2022],
            'F-150 Lightning': [2022, 2025],
            'Mustang Mach-E': [2021, 2025]
        }
    },
    Chevrolet: {
        models: ['Silverado 1500', 'Equinox', 'Malibu', 'Cruze', 'Traverse', 'Tahoe', 'Camaro', 'Impala', 'Suburban', 'Sonic', 'Colorado', 'Blazer', 'Trax', 'Spark', 'Bolt EV', 'Bolt EUV', 'Corvette', 'Trailblazer'],
        yearRanges: {
            'Cruze': [2011, 2019],
            'Sonic': [2012, 2020],
            'Impala': [2010, 2020],
            'Spark': [2013, 2022],
            'Colorado': [2015, 2025],
            'Trax': [2015, 2025],
            'Blazer': [2019, 2025],
            'Bolt EV': [2017, 2025],
            'Bolt EUV': [2022, 2025],
            'Trailblazer': [2021, 2025]
        }
    },
    Nissan: {
        models: ['Altima', 'Sentra', 'Rogue', 'Maxima', 'Pathfinder', 'Frontier', 'Versa', 'Murano', '370Z', 'Titan', 'Kicks', 'Armada', 'Leaf', 'Ariya', 'Z'],
        yearRanges: {
            '370Z': [2010, 2020],
            'Kicks': [2018, 2025],
            'Leaf': [2011, 2025],
            'Ariya': [2023, 2025],
            'Z': [2023, 2025]
        }
    },
    Jeep: {
        models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Patriot', 'Renegade', 'Gladiator', 'Wagoneer', 'Grand Wagoneer'],
        yearRanges: {
            'Patriot': [2010, 2017],
            'Renegade': [2015, 2025],
            'Gladiator': [2020, 2025],
            'Wagoneer': [2022, 2025],
            'Grand Wagoneer': [2022, 2025]
        }
    },
    Ram: {
        models: ['1500', '2500', '3500', 'ProMaster'],
        yearRanges: {
            '1500': [2011, 2025],
            '2500': [2011, 2025],
            '3500': [2011, 2025],
            'ProMaster': [2014, 2025]
        }
    },
    Dodge: {
        models: ['Charger', 'Challenger', 'Durango', 'Journey', 'Dart', 'Hornet'],
        yearRanges: {
            'Journey': [2010, 2020],
            'Dart': [2013, 2016],
            'Hornet': [2023, 2025]
        }
    },
    GMC: {
        models: ['Sierra 1500', 'Terrain', 'Acadia', 'Yukon', 'Canyon', 'Hummer EV'],
        yearRanges: {
            'Canyon': [2015, 2025],
            'Hummer EV': [2022, 2025]
        }
    },
    Hyundai: {
        models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Genesis', 'Kona', 'Palisade', 'Venue', 'Veloster', 'Ioniq 5', 'Ioniq 6', 'Santa Cruz'],
        yearRanges: {
            'Genesis': [2010, 2016],
            'Veloster': [2012, 2021],
            'Kona': [2018, 2025],
            'Palisade': [2020, 2025],
            'Venue': [2020, 2025],
            'Ioniq 5': [2022, 2025],
            'Ioniq 6': [2023, 2025],
            'Santa Cruz': [2022, 2025]
        }
    },
    Kia: {
        models: ['Optima', 'Sorento', 'Soul', 'Sportage', 'Forte', 'Rio', 'Telluride', 'Seltos', 'K5', 'Stinger', 'Niro', 'EV6', 'Carnival'],
        yearRanges: {
            'Optima': [2010, 2020],
            'Rio': [2012, 2020],
            'Telluride': [2020, 2025],
            'Seltos': [2021, 2025],
            'K5': [2021, 2025],
            'Stinger': [2018, 2023],
            'Niro': [2017, 2025],
            'EV6': [2022, 2025],
            'Carnival': [2022, 2025]
        }
    },
    Subaru: {
        models: ['Outback', 'Forester', 'Impreza', 'Legacy', 'WRX', 'XV Crosstrek', 'Crosstrek', 'Ascent', 'BRZ', 'Solterra'],
        yearRanges: {
            'XV Crosstrek': [2013, 2015],
            'Crosstrek': [2016, 2025],
            'WRX': [2015, 2025],
            'Ascent': [2019, 2025],
            'BRZ': [2013, 2025],
            'Solterra': [2023, 2025]
        }
    },
    Mazda: {
        models: ['Mazda3', 'CX-5', 'Mazda6', 'CX-9', 'MX-5 Miata', 'CX-30', 'CX-50', 'CX-90', 'Mazda2'],
        yearRanges: {
            'CX-5': [2013, 2025],
            'Mazda2': [2011, 2014],
            'CX-30': [2020, 2025],
            'CX-50': [2023, 2025],
            'CX-90': [2024, 2025]
        }
    },
    Volkswagen: {
        models: ['Jetta', 'Passat', 'Tiguan', 'Golf', 'Beetle', 'Atlas', 'Taos', 'ID.4', 'Arteon'],
        yearRanges: {
            'Beetle': [2012, 2019],
            'Passat': [2010, 2022],
            'Atlas': [2018, 2025],
            'Taos': [2022, 2025],
            'ID.4': [2021, 2025],
            'Arteon': [2019, 2025]
        }
    },
    Acura: {
        models: ['TL', 'TLX', 'MDX', 'RDX', 'TSX', 'ILX', 'NSX', 'Integra'],
        yearRanges: {
            'TL': [2010, 2014],
            'TSX': [2010, 2014],
            'TLX': [2015, 2025],
            'NSX': [2017, 2022],
            'Integra': [2023, 2025]
        }
    },
    Lexus: {
        models: ['RX 350', 'ES 350', 'IS 250', 'IS 350', 'GX 460', 'NX 200t', 'NX 350', 'UX 200', 'LC 500', 'LS 500', 'RZ', 'TX'],
        yearRanges: {
            'IS 250': [2010, 2015],
            'IS 350': [2010, 2025],
            'NX 200t': [2015, 2017],
            'NX 350': [2022, 2025],
            'UX 200': [2019, 2025],
            'LC 500': [2018, 2025],
            'LS 500': [2018, 2025],
            'RZ': [2023, 2025],
            'TX': [2024, 2025]
        }
    },
    BMW: {
        models: ['3 Series', '5 Series', 'X3', 'X5', 'X1', 'X7', '4 Series', 'iX', 'i4', 'X2'],
        yearRanges: {
            'X1': [2013, 2025],
            'X7': [2019, 2025],
            '4 Series': [2014, 2025],
            'iX': [2022, 2025],
            'i4': [2022, 2025],
            'X2': [2018, 2025]
        }
    },
    'Mercedes-Benz': {
        models: ['C-Class', 'E-Class', 'M-Class', 'GLE-Class', 'GL-Class', 'GLS-Class', 'GLA-Class', 'GLB-Class', 'GLC-Class', 'A-Class', 'EQS', 'EQE'],
        yearRanges: {
            'M-Class': [2010, 2015],
            'GL-Class': [2010, 2016],
            'GLE-Class': [2016, 2025],
            'GLS-Class': [2017, 2025],
            'GLA-Class': [2015, 2025],
            'GLB-Class': [2020, 2025],
            'GLC-Class': [2016, 2025],
            'A-Class': [2019, 2025],
            'EQS': [2022, 2025],
            'EQE': [2023, 2025]
        }
    },
    Audi: {
        models: ['A4', 'Q5', 'A6', 'A3', 'Q3', 'Q7', 'Q8', 'e-tron', 'A5'],
        yearRanges: {
            'A3': [2015, 2025],
            'Q3': [2015, 2025],
            'Q7': [2010, 2025],
            'Q8': [2019, 2025],
            'e-tron': [2019, 2025],
            'A5': [2010, 2025]
        }
    },
    Cadillac: {
        models: ['SRX', 'XT5', 'Escalade', 'CTS', 'CT5', 'ATS', 'CT4', 'XT4', 'XT6', 'Lyriq'],
        yearRanges: {
            'SRX': [2010, 2016],
            'CTS': [2010, 2019],
            'ATS': [2013, 2019],
            'XT5': [2017, 2025],
            'CT5': [2020, 2025],
            'CT4': [2020, 2025],
            'XT4': [2019, 2025],
            'XT6': [2020, 2025],
            'Lyriq': [2023, 2025]
        }
    },
    Buick: {
        models: ['Enclave', 'LaCrosse', 'Verano', 'Encore', 'Encore GX', 'Envision'],
        yearRanges: {
            'Verano': [2012, 2017],
            'LaCrosse': [2010, 2019],
            'Encore GX': [2020, 2025],
            'Envision': [2016, 2025]
        }
    },
    Tesla: {
        models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'],
        yearRanges: {
            'Model S': [2012, 2025],
            'Model 3': [2017, 2025],
            'Model X': [2015, 2025],
            'Model Y': [2020, 2025],
            'Cybertruck': [2024, 2025]
        }
    },
    Rivian: {
        models: ['R1T', 'R1S'],
        yearRanges: {
            'R1T': [2022, 2025],
            'R1S': [2022, 2025]
        }
    },
    Genesis: {
        models: ['G70', 'G80', 'G90', 'GV70', 'GV80', 'Electrified G80', 'Electrified GV70'],
        yearRanges: {
            'G70': [2019, 2025],
            'G80': [2017, 2025],
            'G90': [2017, 2025],
            'GV70': [2022, 2025],
            'GV80': [2021, 2025],
            'Electrified G80': [2023, 2025],
            'Electrified GV70': [2023, 2025]
        }
    },
    Volvo: {
        models: ['S60', 'S90', 'XC60', 'XC90', 'XC40', 'C40', 'EX30', 'EX90'],
        yearRanges: {
            'XC40': [2019, 2025],
            'C40': [2022, 2025],
            'EX30': [2024, 2025],
            'EX90': [2024, 2025]
        }
    },
    Porsche: {
        models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
        yearRanges: {
            'Taycan': [2020, 2025]
        }
    },
    'Land Rover': {
        models: ['Range Rover', 'Range Rover Sport', 'Discovery', 'Defender', 'Range Rover Velar', 'Range Rover Evoque', 'Discovery Sport'],
        yearRanges: {
            'Defender': [2020, 2025],
            'Range Rover Velar': [2018, 2025],
            'Discovery Sport': [2015, 2025]
        }
    },
    Jaguar: {
        models: ['F-Pace', 'E-Pace', 'I-Pace', 'XE', 'XF', 'XJ'],
        yearRanges: {
            'F-Pace': [2017, 2025],
            'E-Pace': [2018, 2025],
            'I-Pace': [2019, 2025],
            'XE': [2017, 2025],
            'XF': [2016, 2025],
            'XJ': [2010, 2019]
        }
    },
    'Alfa Romeo': {
        models: ['Giulia', 'Stelvio', 'Tonale'],
        yearRanges: {
            'Giulia': [2017, 2025],
            'Stelvio': [2018, 2025],
            'Tonale': [2023, 2025]
        }
    },
    Mitsubishi: {
        models: ['Outlander', 'Eclipse Cross', 'Outlander Sport', 'Mirage', 'Lancer'],
        yearRanges: {
            'Outlander Sport': [2011, 2020],
            'Lancer': [2010, 2017],
            'Eclipse Cross': [2018, 2025]
        }
    }
};

// Generate all vehicle combinations
function generateVehicles() {
    const vehicles = [];
    const defaultYears = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

    for (const [make, data] of Object.entries(vehicleData)) {
        for (const model of data.models) {
            let years = defaultYears;

            // Check if model has specific year range
            if (data.yearRanges && data.yearRanges[model]) {
                const range = data.yearRanges[model];
                if (Array.isArray(range) && range.length === 2) {
                    // Continuous range [start, end]
                    years = [];
                    for (let y = range[0]; y <= range[1]; y++) {
                        years.push(y);
                    }
                } else if (Array.isArray(range) && range.length === 4) {
                    // Two separate ranges [start1, end1, start2, end2]
                    years = [];
                    for (let y = range[0]; y <= range[1]; y++) {
                        years.push(y);
                    }
                    for (let y = range[2]; y <= range[3]; y++) {
                        years.push(y);
                    }
                }
            }

            // Add vehicle for each year
            for (const year of years) {
                vehicles.push({ make, model, year });
            }
        }
    }

    return vehicles;
}

const vehicles = generateVehicles();
console.log(`Preparing to seed ${vehicles.length} vehicles from 2010-2025...`);

// Connect and insert
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');

    db.query('SHOW TABLES LIKE "vehicle_reference"', (err, results) => {
        if (err) {
            console.error('Error checking tables:', err);
            db.end();
            return;
        }

        if (results.length === 0) {
            console.error('vehicle_reference table does not exist!');
            console.log('Please run: node migrate.js first');
            db.end();
            return;
        }

        // Clear existing data
        console.log('Clearing existing vehicle reference data...');
        db.query('DELETE FROM vehicle_reference', (err) => {
            if (err) {
                console.error('Error clearing table:', err);
                db.end();
                return;
            }

            console.log('Starting to insert vehicles...');
            
            // Insert in batches of 100
            const batchSize = 100;
            let inserted = 0;

            const insertBatch = (startIndex) => {
                if (startIndex >= vehicles.length) {
                    console.log(`\n✅ Completed! Inserted ${inserted} vehicles`);
                    console.log(`\n📊 Summary by Make:`);
                    
                    // Count by make
                    const counts = {};
                    vehicles.forEach(v => {
                        counts[v.make] = (counts[v.make] || 0) + 1;
                    });
                    
                    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([make, count]) => {
                        console.log(`   ${make}: ${count} vehicles`);
                    });
                    
                    db.end();
                    return;
                }

                const batch = vehicles.slice(startIndex, startIndex + batchSize);
                const values = batch.map(v => [v.make, v.model, v.year]);
                const query = 'INSERT INTO vehicle_reference (make, model, year) VALUES ?';

                db.query(query, [values], (err, result) => {
                    if (err) {
                        console.error(`Error inserting batch at ${startIndex}:`, err.message);
                    } else {
                        inserted += result.affectedRows;
                        process.stdout.write(`\rProgress: ${inserted}/${vehicles.length} vehicles...`);
                    }
                    insertBatch(startIndex + batchSize);
                });
            };

            insertBatch(0);
        });
    });
});
