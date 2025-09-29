const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dbConfig = require('./config/database');
const emailService = require('./services/emailService');
const configStore = require('./utils/configStore');
require('dotenv').config();

const app = express();
let port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectTimeout: dbConfig.connectTimeout
});

// Test database connection
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Connected to MySQL database');
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'PalmExitGarage API - Professional Auto Repair Services' });
});

// ===== CUSTOMERS =====
// Get all customers
app.get('/api/customers', (req, res) => {
    const query = 'SELECT * FROM customers ORDER BY last_name, first_name';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Get single customer
app.get('/api/customers/:id', (req, res) => {
    const query = 'SELECT * FROM customers WHERE customer_id = ?';
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Add new customer
app.post('/api/customers', (req, res) => {
    const { first_name, last_name, email, phone, address, city, state, zip_code } = req.body;
    
    // Server-side validation
    if (!first_name || !first_name.trim()) {
        res.status(400).json({ error: 'First name is required' });
        return;
    }
    if (!last_name || !last_name.trim()) {
        res.status(400).json({ error: 'Last name is required' });
        return;
    }
    if (!email || !email.trim()) {
        res.status(400).json({ error: 'Email address is required' });
        return;
    }
    if (!phone || !phone.trim()) {
        res.status(400).json({ error: 'Phone number is required' });
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }
    
    const query = 'INSERT INTO customers (first_name, last_name, email, phone, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [first_name.trim(), last_name.trim(), email.trim(), phone.trim(), address?.trim(), city?.trim(), state?.trim(), zip_code?.trim()], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Customer added successfully', customer_id: result.insertId });
    });
});

// ===== VEHICLES =====
// Get all vehicles
app.get('/api/vehicles', (req, res) => {
    const query = `
        SELECT v.*, CONCAT(c.first_name, ' ', c.last_name) as customer_name 
        FROM vehicles v 
        JOIN customers c ON v.customer_id = c.customer_id 
        ORDER BY c.last_name, v.year DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Get vehicles by customer
app.get('/api/customers/:customerId/vehicles', (req, res) => {
    const query = 'SELECT * FROM vehicles WHERE customer_id = ? ORDER BY year DESC';
    db.query(query, [req.params.customerId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Add new vehicle
app.post('/api/vehicles', (req, res) => {
    const { customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes } = req.body;
    const query = 'INSERT INTO vehicles (customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Vehicle added successfully', vehicle_id: result.insertId });
    });
});

// ===== PARTS =====
// Get all parts
app.get('/api/parts', (req, res) => {
    const query = `
        SELECT *,
               CASE WHEN quantity_on_hand > 0 THEN true ELSE false END as in_stock
        FROM parts 
        ORDER BY category, brand, item
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Add new part
app.post('/api/parts', (req, res) => {
    const { 
        brand, 
        item, 
        part_number, 
        cost_paid_cents,    // wholesale cost
        cost_charged_cents, // retail cost
        cost_cents,         // legacy field for backward compatibility
        category, 
        description, 
        quantity_on_hand 
    } = req.body;
    
    // Calculate profit
    const wholesaleCost = cost_paid_cents || cost_cents || 0;
    const retailCost = cost_charged_cents || cost_cents || 0;
    const profit = retailCost - wholesaleCost;
    
    const query = `INSERT INTO parts 
        (brand, item, part_number, cost_paid_cents, cost_charged_cents, cost_cents, profit_cents, category, description, quantity_on_hand) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(query, [
        brand, 
        item, 
        part_number, 
        wholesaleCost,
        retailCost,
        retailCost,    // keep cost_cents as retail for compatibility
        profit,
        category, 
        description, 
        quantity_on_hand || 0
    ], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Part added successfully', part_id: result.insertId });
    });
});

// Update part
app.put('/api/parts/:id', (req, res) => {
    const { 
        brand, 
        item, 
        part_number, 
        cost_paid_cents,    // wholesale cost
        cost_charged_cents, // retail cost
        cost_cents,         // legacy field for backward compatibility
        category, 
        description, 
        quantity_on_hand 
    } = req.body;
    
    // Calculate profit
    const wholesaleCost = cost_paid_cents || cost_cents || 0;
    const retailCost = cost_charged_cents || cost_cents || 0;
    const profit = retailCost - wholesaleCost;
    
    const query = `UPDATE parts SET 
        brand = ?, item = ?, part_number = ?, 
        cost_paid_cents = ?, cost_charged_cents = ?, cost_cents = ?, profit_cents = ?,
        category = ?, description = ?, quantity_on_hand = ? 
        WHERE part_id = ?`;
    
    db.query(query, [
        brand, 
        item, 
        part_number, 
        wholesaleCost,
        retailCost,
        retailCost,    // keep cost_cents as retail for compatibility
        profit,
        category, 
        description, 
        quantity_on_hand || 0,
        req.params.id
    ], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Part not found' });
            return;
        }
        res.json({ message: 'Part updated successfully' });
    });
});

// Delete part
app.delete('/api/parts/:id', (req, res) => {
    const query = 'DELETE FROM parts WHERE part_id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Part not found' });
            return;
        }
        res.json({ message: 'Part deleted successfully' });
    });
});

// ===== LABOR =====
// Get all labor items
app.get('/api/labor', (req, res) => {
    const query = 'SELECT * FROM labor ORDER BY category, labor_name';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Add new labor item
app.post('/api/labor', (req, res) => {
    const { labor_name, labor_cost_cents, category, description, estimated_time_hours } = req.body;
    const query = 'INSERT INTO labor (labor_name, labor_cost_cents, category, description, estimated_time_hours) VALUES (?, ?, ?, ?, ?)';
    
    db.query(query, [labor_name, labor_cost_cents, category, description, estimated_time_hours], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Labor item added successfully', labor_id: result.insertId });
    });
});

// Update labor item
app.put('/api/labor/:id', (req, res) => {
    const { labor_name, labor_cost_cents, category, description, estimated_time_hours } = req.body;
    const query = 'UPDATE labor SET labor_name = ?, labor_cost_cents = ?, category = ?, description = ?, estimated_time_hours = ? WHERE labor_id = ?';
    
    db.query(query, [labor_name, labor_cost_cents, category, description, estimated_time_hours, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Labor item not found' });
            return;
        }
        res.json({ message: 'Labor item updated successfully' });
    });
});

// Delete labor item
app.delete('/api/labor/:id', (req, res) => {
    const query = 'DELETE FROM labor WHERE labor_id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Labor item not found' });
            return;
        }
        res.json({ message: 'Labor item deleted successfully' });
    });
});

// ===== VEHICLE REFERENCE =====
// Get vehicle makes
app.get('/api/vehicle-reference/makes', (req, res) => {
    const query = 'SELECT DISTINCT make FROM vehicle_reference ORDER BY make';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results.map(row => row.make));
    });
});

// Get vehicle models by make
app.get('/api/vehicle-reference/models/:make', (req, res) => {
    const query = 'SELECT DISTINCT model FROM vehicle_reference WHERE make = ? ORDER BY model';
    db.query(query, [req.params.make], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results.map(row => row.model));
    });
});

// Get vehicle years by make and model
app.get('/api/vehicle-reference/years/:make/:model', (req, res) => {
    const query = 'SELECT DISTINCT year FROM vehicle_reference WHERE make = ? AND model = ? ORDER BY year DESC';
    db.query(query, [req.params.make, req.params.model], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results.map(row => row.year));
    });
});

// Search vehicle reference with auto-complete
app.get('/api/vehicle-reference/search', (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) {
        res.json([]);
        return;
    }
    
    const searchQuery = `
        SELECT DISTINCT make, model, year 
        FROM vehicle_reference 
        WHERE make LIKE ? OR model LIKE ?
        ORDER BY make, model, year DESC 
        LIMIT 20
    `;
    
    const searchTerm = `%${query}%`;
    db.query(searchQuery, [searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Get all vehicle reference data
app.get('/api/vehicle-reference', (req, res) => {
    const query = 'SELECT * FROM vehicle_reference ORDER BY make, model, year DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Add vehicle reference entry
app.post('/api/vehicle-reference', (req, res) => {
    const { year, make, model } = req.body;
    const query = 'INSERT INTO vehicle_reference (year, make, model) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE make = VALUES(make), model = VALUES(model)';
    
    db.query(query, [year, make, model], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json({ message: 'Vehicle reference added successfully', id: result.insertId });
    });
});

// Update vehicle reference entry
app.put('/api/vehicle-reference/:id', (req, res) => {
    const { year, make, model } = req.body;
    const query = 'UPDATE vehicle_reference SET year = ?, make = ?, model = ? WHERE id = ?';
    
    db.query(query, [year, make, model, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Vehicle reference not found' });
            return;
        }
        res.json({ message: 'Vehicle reference updated successfully' });
    });
});

// Delete vehicle reference entry
app.delete('/api/vehicle-reference/:id', (req, res) => {
    const query = 'DELETE FROM vehicle_reference WHERE id = ?';
    
    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Vehicle reference not found' });
            return;
        }
        res.json({ message: 'Vehicle reference deleted successfully' });
    });
});

// ===== SEARCH ENDPOINTS =====
// Search customers
app.get('/api/customers/search', (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) {
        res.json([]);
        return;
    }
    
    const searchQuery = `
        SELECT customer_id, first_name, last_name, phone, email 
        FROM customers 
        WHERE first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR email LIKE ?
        ORDER BY last_name, first_name 
        LIMIT 20
    `;
    
    const searchTerm = `%${query}%`;
    db.query(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Search parts
app.get('/api/parts/search', (req, res) => {
    const { query } = req.query;
    if (!query || query.length < 2) {
        res.json([]);
        return;
    }
    
    const searchQuery = `
        SELECT part_id, brand, item, part_number, cost_cents, category, in_stock 
        FROM parts 
        WHERE brand LIKE ? OR item LIKE ? OR part_number LIKE ? OR category LIKE ?
        ORDER BY brand, item 
        LIMIT 20
    `;
    
    const searchTerm = `%${query}%`;
    db.query(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Update customer
app.put('/api/customers/:id', (req, res) => {
    const { first_name, last_name, email, phone, address, city, state, zip_code } = req.body;
    
    // Server-side validation
    if (!first_name || !first_name.trim()) {
        res.status(400).json({ error: 'First name is required' });
        return;
    }
    if (!last_name || !last_name.trim()) {
        res.status(400).json({ error: 'Last name is required' });
        return;
    }
    if (!email || !email.trim()) {
        res.status(400).json({ error: 'Email address is required' });
        return;
    }
    if (!phone || !phone.trim()) {
        res.status(400).json({ error: 'Phone number is required' });
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }
    
    const query = 'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ? WHERE customer_id = ?';
    
    db.query(query, [first_name.trim(), last_name.trim(), email.trim(), phone.trim(), address?.trim(), city?.trim(), state?.trim(), zip_code?.trim(), req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json({ message: 'Customer updated successfully' });
    });
});

// Delete customer (with cascade delete of vehicles and work orders)
app.delete('/api/customers/:id', (req, res) => {
    const customerId = req.params.id;
    
    // First, let's get some information about what will be deleted for logging/confirmation
    const infoQuery = `
        SELECT 
            c.customer_id,
            CONCAT(c.first_name, ' ', c.last_name) as customer_name,
            c.email,
            COUNT(DISTINCT v.vehicle_id) as vehicle_count,
            COUNT(DISTINCT wo.work_order_id) as work_order_count
        FROM customers c
        LEFT JOIN vehicles v ON c.customer_id = v.customer_id
        LEFT JOIN work_orders wo ON c.customer_id = wo.customer_id
        WHERE c.customer_id = ?
        GROUP BY c.customer_id
    `;
    
    db.query(infoQuery, [customerId], (err, infoResults) => {
        if (err) {
            console.error('Error fetching customer info for deletion:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        if (infoResults.length === 0) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        
        const customerInfo = infoResults[0];
        console.log(`Deleting customer: ${customerInfo.customer_name} (${customerInfo.email})`);
        console.log(`This will also delete: ${customerInfo.vehicle_count} vehicle(s), ${customerInfo.work_order_count} work order(s)`);
        
        // Now delete the customer (CASCADE will handle vehicles, work orders, etc.)
        const deleteQuery = 'DELETE FROM customers WHERE customer_id = ?';
        
        db.query(deleteQuery, [customerId], (err, result) => {
            if (err) {
                console.error('Error deleting customer:', err);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Customer not found' });
                return;
            }
            
            console.log(`Successfully deleted customer ${customerInfo.customer_name} and all related data`);
            res.json({ 
                message: 'Customer deleted successfully', 
                deletedCustomer: customerInfo.customer_name,
                vehiclesDeleted: customerInfo.vehicle_count,
                workOrdersDeleted: customerInfo.work_order_count
            });
        });
    });
});

// Update vehicle
app.put('/api/vehicles/:id', (req, res) => {
    const { customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes } = req.body;
    const query = 'UPDATE vehicles SET customer_id = ?, year = ?, make = ?, model = ?, vin = ?, license_plate = ?, color = ?, mileage = ?, engine_size = ?, transmission = ?, notes = ? WHERE vehicle_id = ?';
    
    db.query(query, [customer_id, year, make, model, vin, license_plate, color, mileage, engine_size, transmission, notes, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Vehicle not found' });
            return;
        }
        res.json({ message: 'Vehicle updated successfully' });
    });
});

// Get customer with repair history
app.get('/api/customers/:id/history', (req, res) => {
    const customerQuery = 'SELECT * FROM customers WHERE customer_id = ?';
    const vehiclesQuery = 'SELECT * FROM vehicles WHERE customer_id = ? ORDER BY year DESC';
    const workOrdersQuery = `
        SELECT wo.*, 
               CONCAT(v.year, ' ', v.make, ' ', v.model) as vehicle_desc,
               COUNT(wop.id) as part_count,
               COUNT(wol.id) as labor_count
        FROM work_orders wo
        JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
        LEFT JOIN work_order_parts wop ON wo.work_order_id = wop.work_order_id
        LEFT JOIN work_order_labor wol ON wo.work_order_id = wol.work_order_id
        WHERE wo.customer_id = ?
        GROUP BY wo.work_order_id
        ORDER BY wo.created_at DESC
    `;
    
    db.query(customerQuery, [req.params.id], (err, customerResult) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (customerResult.length === 0) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        
        db.query(vehiclesQuery, [req.params.id], (err, vehiclesResult) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            db.query(workOrdersQuery, [req.params.id], (err, workOrdersResult) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Database error' });
                    return;
                }
                
                res.json({
                    customer: customerResult[0],
                    vehicles: vehiclesResult,
                    workOrders: workOrdersResult
                });
            });
        });
    });
});

// ===== WORK ORDERS / ESTIMATES =====
// Get all work orders
app.get('/api/work-orders', (req, res) => {
    const query = `
        SELECT wo.*, 
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               CONCAT(v.year, ' ', v.make, ' ', v.model) as vehicle_desc
        FROM work_orders wo
        JOIN customers c ON wo.customer_id = c.customer_id
        JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
        ORDER BY wo.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Create new work order/estimate
app.post('/api/work-orders', (req, res) => {
    const { customer_id, vehicle_id, parts, labor, tax_rate, notes } = req.body;
    
    // Calculate totals
    let subtotal_cents = 0;
    
    // Add parts cost
    if (parts && parts.length > 0) {
        subtotal_cents += parts.reduce((sum, part) => sum + (part.cost_cents * part.quantity), 0);
    }
    
    // Add labor cost
    if (labor && labor.length > 0) {
        subtotal_cents += labor.reduce((sum, laborItem) => sum + (laborItem.cost_cents * laborItem.quantity), 0);
    }
    
    const tax_cents = Math.round(subtotal_cents * (tax_rate || 0.0825));
    const total_cents = subtotal_cents + tax_cents;
    
    // Insert work order
    const woQuery = 'INSERT INTO work_orders (customer_id, vehicle_id, subtotal_cents, tax_cents, total_cents, tax_rate, notes) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
    db.query(woQuery, [customer_id, vehicle_id, subtotal_cents, tax_cents, total_cents, tax_rate || 0.0825, notes], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error creating work order' });
            return;
        }
        
        const work_order_id = result.insertId;
        let promises = [];
        
        // Insert parts
        if (parts && parts.length > 0) {
            const partQuery = 'INSERT INTO work_order_parts (work_order_id, part_id, quantity, cost_cents) VALUES ?';
            const partValues = parts.map(p => [work_order_id, p.part_id, p.quantity, p.cost_cents]);
            promises.push(new Promise((resolve, reject) => {
                db.query(partQuery, [partValues], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            }));
        }
        
        // Insert labor
        if (labor && labor.length > 0) {
            const laborQuery = 'INSERT INTO work_order_labor (work_order_id, labor_id, quantity, cost_cents) VALUES ?';
            const laborValues = labor.map(l => [work_order_id, l.labor_id, l.quantity, l.cost_cents]);
            promises.push(new Promise((resolve, reject) => {
                db.query(laborQuery, [laborValues], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            }));
        }
        
        Promise.all(promises)
            .then(() => {
                res.json({ 
                    message: 'Work order created successfully', 
                    work_order_id: work_order_id,
                    total_cents: total_cents
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({ error: 'Error adding work order items' });
            });
    });
});

// Get single work order with details
app.get('/api/work-orders/:id', (req, res) => {
    const workOrderQuery = `
        SELECT wo.*, 
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               c.phone as customer_phone,
               c.email as customer_email,
               CONCAT(v.year, ' ', v.make, ' ', v.model) as vehicle_desc,
               v.vin, v.license_plate, v.mileage
        FROM work_orders wo
        JOIN customers c ON wo.customer_id = c.customer_id
        JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
        WHERE wo.work_order_id = ?
    `;
    
    const partsQuery = `
        SELECT wop.*, p.brand, p.item, p.part_number, p.description
        FROM work_order_parts wop
        JOIN parts p ON wop.part_id = p.part_id
        WHERE wop.work_order_id = ?
    `;
    
    const laborQuery = `
        SELECT wol.*, l.labor_name, l.description, l.estimated_time_hours
        FROM work_order_labor wol
        JOIN labor l ON wol.labor_id = l.labor_id
        WHERE wol.work_order_id = ?
    `;
    
    db.query(workOrderQuery, [req.params.id], (err, workOrderResult) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        if (workOrderResult.length === 0) {
            res.status(404).json({ error: 'Work order not found' });
            return;
        }
        
        db.query(partsQuery, [req.params.id], (err, partsResult) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Database error' });
                return;
            }
            
            db.query(laborQuery, [req.params.id], (err, laborResult) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Database error' });
                    return;
                }
                
                res.json({
                    workOrder: workOrderResult[0],
                    parts: partsResult,
                    labor: laborResult
                });
            });
        });
    });
});

// Delete work order
app.delete('/api/work-orders/:id', (req, res) => {
    const workOrderId = req.params.id;
    
    // Start transaction to delete work order and related items
    db.beginTransaction((err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        // Delete work order parts first
        db.query('DELETE FROM work_order_parts WHERE work_order_id = ?', [workOrderId], (err) => {
            if (err) {
                return db.rollback(() => {
                    console.error(err);
                    res.status(500).json({ error: 'Database error deleting parts' });
                });
            }
            
            // Delete work order labor
            db.query('DELETE FROM work_order_labor WHERE work_order_id = ?', [workOrderId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        console.error(err);
                        res.status(500).json({ error: 'Database error deleting labor' });
                    });
                }
                
                // Finally delete the work order
                db.query('DELETE FROM work_orders WHERE work_order_id = ?', [workOrderId], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).json({ error: 'Database error deleting work order' });
                        });
                    }
                    
                    if (result.affectedRows === 0) {
                        return db.rollback(() => {
                            res.status(404).json({ error: 'Work order not found' });
                        });
                    }
                    
                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error(err);
                                res.status(500).json({ error: 'Database error committing transaction' });
                            });
                        }
                        
                        res.json({ 
                            message: 'Work order deleted successfully',
                            work_order_id: workOrderId
                        });
                    });
                });
            });
        });
    });
});

// Update work order status
app.put('/api/work-orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const workOrderId = req.params.id;
    
    const validStatuses = ['Estimate', 'Approved', 'Started', 'Complete', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value. Valid statuses are: Estimate, Approved, Started, Complete, Cancelled' });
    }
    
    const query = 'UPDATE work_orders SET status = ? WHERE work_order_id = ?';
    
    db.query(query, [status, workOrderId], async (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error updating status' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Work order not found' });
            return;
        }
        
        res.json({ 
            message: `Work order status updated to ${status}`,
            work_order_id: workOrderId,
            status: status
        });
    });
});

// Update work order with signature
app.put('/api/work-orders/:id/signature', async (req, res) => {
    const { signature_data, customer_signature_name, signature_type, status, signed_date } = req.body;
    const workOrderId = req.params.id;
    
    // Convert ISO date string to MySQL datetime format
    let mysqlDate = null;
    if (signed_date) {
        // Parse ISO string and format for MySQL: YYYY-MM-DD HH:MM:SS
        const date = new Date(signed_date);
        mysqlDate = date.getFullYear() + '-' +
                   String(date.getMonth() + 1).padStart(2, '0') + '-' +
                   String(date.getDate()).padStart(2, '0') + ' ' +
                   String(date.getHours()).padStart(2, '0') + ':' +
                   String(date.getMinutes()).padStart(2, '0') + ':' +
                   String(date.getSeconds()).padStart(2, '0');
    }
    
    const query = `
        UPDATE work_orders 
        SET signature_data = ?, customer_signature_name = ?, signature_type = ?, status = ?, signed_date = ?
        WHERE work_order_id = ?
    `;
    
    db.query(query, [signature_data, customer_signature_name, signature_type, status, mysqlDate, workOrderId], async (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database error updating signature' });
            return;
        }
        
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Work order not found' });
            return;
        }
        
        // Automatically send receipt email when work order is signed (if email is configured)
        if (emailService.isConfigured) {
            try {
                // Get work order data for email
                const workOrderQuery = `
                    SELECT wo.*, 
                           c.first_name, c.last_name, c.phone, c.email, c.address, c.city, c.state, c.zip_code,
                           v.year, v.make, v.model, v.vin, v.license_plate, v.mileage
                    FROM work_orders wo
                    JOIN customers c ON wo.customer_id = c.customer_id
                    JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
                    WHERE wo.work_order_id = ?
                `;
                
                const partsQuery = `
                    SELECT wop.*, p.brand, p.item, p.part_number, p.description
                    FROM work_order_parts wop
                    JOIN parts p ON wop.part_id = p.part_id
                    WHERE wop.work_order_id = ?
                `;
                
                const laborQuery = `
                    SELECT wol.*, l.labor_name, l.description, l.estimated_time_hours
                    FROM work_order_labor wol
                    JOIN labor l ON wol.labor_id = l.labor_id
                    WHERE wol.work_order_id = ?
                `;
                
                const workOrderResult = await new Promise((resolve, reject) => {
                    db.query(workOrderQuery, [workOrderId], (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });
                
                if (workOrderResult.length > 0) {
                    const partsResult = await new Promise((resolve, reject) => {
                        db.query(partsQuery, [workOrderId], (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });
                    
                    const laborResult = await new Promise((resolve, reject) => {
                        db.query(laborQuery, [workOrderId], (err, results) => {
                            if (err) reject(err);
                            else resolve(results);
                        });
                    });
                    
                    const workOrder = workOrderResult[0];
                    
                    // Only send if customer has email
                    if (workOrder.email) {
                        const workOrderData = {
                            workOrder: workOrder,
                            customer: {
                                first_name: workOrder.first_name,
                                last_name: workOrder.last_name,
                                phone: workOrder.phone,
                                email: workOrder.email,
                                address: workOrder.address,
                                city: workOrder.city,
                                state: workOrder.state,
                                zip_code: workOrder.zip_code
                            },
                            vehicle: {
                                year: workOrder.year,
                                make: workOrder.make,
                                model: workOrder.model,
                                vin: workOrder.vin,
                                license_plate: workOrder.license_plate,
                                mileage: workOrder.mileage
                            },
                            parts: partsResult,
                            labor: laborResult
                        };
                        
                        // Send receipt email
                        const emailResult = await emailService.sendWorkOrderReceipt(workOrderData);
                        console.log(`Receipt email sent for signed Work Order #${workOrderId}:`, emailResult);
                        
                        res.json({ 
                            message: `Work order signature saved successfully (${signature_type} signature). Receipt sent to ${workOrder.email}`,
                            work_order_id: workOrderId,
                            signature_type: signature_type,
                            email_sent: true,
                            email_recipient: workOrder.email
                        });
                    } else {
                        console.log(`Work Order #${workOrderId} signed but no customer email found`);
                        res.json({ 
                            message: `Work order signature saved successfully (${signature_type} signature)`,
                            work_order_id: workOrderId,
                            signature_type: signature_type,
                            email_sent: false,
                            email_note: 'Customer email not found'
                        });
                    }
                } else {
                    res.json({ 
                        message: `Work order signature saved successfully (${signature_type} signature)`,
                        work_order_id: workOrderId,
                        signature_type: signature_type
                    });
                }
            } catch (emailError) {
                console.error('Error sending receipt email after signature:', emailError);
                // Still return success for signature save, but note email issue
                res.json({ 
                    message: `Work order signature saved successfully (${signature_type} signature). Receipt email failed to send.`,
                    work_order_id: workOrderId,
                    signature_type: signature_type,
                    email_sent: false,
                    email_error: emailError.message
                });
            }
        } else {
            // Email not configured, just return signature success
            res.json({ 
                message: `Work order signature saved successfully (${signature_type} signature)`,
                work_order_id: workOrderId,
                signature_type: signature_type
            });
        }
    });
});

// ===== EMAIL SERVICE ENDPOINTS =====
// Configure email service
app.post('/api/email/configure', (req, res) => {
    const { email, password, shopName } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const success = emailService.configure({ email, password, shopName });
        if (success) {
            res.json({ message: 'Email service configured successfully', email: email });
        } else {
            res.status(500).json({ error: 'Failed to configure email service' });
        }
    } catch (error) {
        console.error('Email configuration error:', error);
        res.status(500).json({ error: 'Email configuration failed: ' + error.message });
    }
});

// Test email configuration
app.post('/api/email/test', async (req, res) => {
    const { recipientEmail } = req.body;
    
    if (!recipientEmail) {
        return res.status(400).json({ error: 'Recipient email is required' });
    }
    
    try {
        const result = await emailService.sendTestEmail(recipientEmail);
        res.json({ message: 'Test email sent successfully', ...result });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: 'Failed to send test email: ' + error.message });
    }
});

// Send work order receipt email
app.post('/api/email/send-receipt/:workOrderId', async (req, res) => {
    const workOrderId = req.params.workOrderId;
    
    try {
        // Get work order data with all details
        const workOrderQuery = `
            SELECT wo.*, 
                   CONCAT(c.first_name, ' ', c.last_name) as customer_name,
                   c.first_name, c.last_name, c.phone, c.email, c.address, c.city, c.state, c.zip_code,
                   v.year, v.make, v.model, v.vin, v.license_plate, v.mileage
            FROM work_orders wo
            JOIN customers c ON wo.customer_id = c.customer_id
            JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
            WHERE wo.work_order_id = ?
        `;
        
        const partsQuery = `
            SELECT wop.*, p.brand, p.item, p.part_number, p.description
            FROM work_order_parts wop
            JOIN parts p ON wop.part_id = p.part_id
            WHERE wop.work_order_id = ?
        `;
        
        const laborQuery = `
            SELECT wol.*, l.labor_name, l.description, l.estimated_time_hours
            FROM work_order_labor wol
            JOIN labor l ON wol.labor_id = l.labor_id
            WHERE wol.work_order_id = ?
        `;
        
        // Execute all queries
        const workOrderResult = await new Promise((resolve, reject) => {
            db.query(workOrderQuery, [workOrderId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        if (workOrderResult.length === 0) {
            return res.status(404).json({ error: 'Work order not found' });
        }
        
        const partsResult = await new Promise((resolve, reject) => {
            db.query(partsQuery, [workOrderId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        const laborResult = await new Promise((resolve, reject) => {
            db.query(laborQuery, [workOrderId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        const workOrder = workOrderResult[0];
        
        // Check if customer has email
        if (!workOrder.email) {
            return res.status(400).json({ error: 'Customer email not found' });
        }
        
        // Prepare data for email template
        const workOrderData = {
            workOrder: workOrder,
            customer: {
                first_name: workOrder.first_name,
                last_name: workOrder.last_name,
                phone: workOrder.phone,
                email: workOrder.email,
                address: workOrder.address,
                city: workOrder.city,
                state: workOrder.state,
                zip_code: workOrder.zip_code
            },
            vehicle: {
                year: workOrder.year,
                make: workOrder.make,
                model: workOrder.model,
                vin: workOrder.vin,
                license_plate: workOrder.license_plate,
                mileage: workOrder.mileage
            },
            parts: partsResult,
            labor: laborResult
        };
        
        // Send email
        const result = await emailService.sendWorkOrderReceipt(workOrderData);
        
        res.json({
            message: 'Work order receipt sent successfully',
            workOrderId: workOrderId,
            ...result
        });
        
    } catch (error) {
        console.error('Send receipt email error:', error);
        res.status(500).json({ error: 'Failed to send receipt email: ' + error.message });
    }
});

// Send work order completion email
app.post('/api/email/send-completion/:workOrderId', async (req, res) => {
    const workOrderId = req.params.workOrderId;
    
    try {
        // Get work order data with all details
        const workOrderQuery = `
            SELECT wo.*, 
                   CONCAT(c.first_name, ' ', c.last_name) as customer_name,
                   c.first_name, c.last_name, c.phone, c.email, c.address, c.city, c.state, c.zip_code,
                   v.year, v.make, v.model, v.vin, v.license_plate, v.mileage
            FROM work_orders wo
            JOIN customers c ON wo.customer_id = c.customer_id
            JOIN vehicles v ON wo.vehicle_id = v.vehicle_id
            WHERE wo.work_order_id = ?
        `;
        
        const partsQuery = `
            SELECT wop.*, p.brand, p.item, p.part_number, p.description
            FROM work_order_parts wop
            JOIN parts p ON wop.part_id = p.part_id
            WHERE wop.work_order_id = ?
        `;
        
        const laborQuery = `
            SELECT wol.*, l.labor_name, l.description, l.estimated_time_hours
            FROM work_order_labor wol
            JOIN labor l ON wol.labor_id = l.labor_id
            WHERE wol.work_order_id = ?
        `;
        
        // Execute all queries
        const workOrderResult = await new Promise((resolve, reject) => {
            db.query(workOrderQuery, [workOrderId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        if (workOrderResult.length === 0) {
            return res.status(404).json({ error: 'Work order not found' });
        }
        
        const partsResult = await new Promise((resolve, reject) => {
            db.query(partsQuery, [workOrderId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        const laborResult = await new Promise((resolve, reject) => {
            db.query(laborQuery, [workOrderId], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        const workOrder = workOrderResult[0];
        
        // Check if customer has email
        if (!workOrder.email) {
            return res.status(400).json({ error: 'Customer email not found' });
        }
        
        // Prepare data for email template
        const workOrderData = {
            workOrder: workOrder,
            customer: {
                first_name: workOrder.first_name,
                last_name: workOrder.last_name,
                phone: workOrder.phone,
                email: workOrder.email,
                address: workOrder.address,
                city: workOrder.city,
                state: workOrder.state,
                zip_code: workOrder.zip_code
            },
            vehicle: {
                year: workOrder.year,
                make: workOrder.make,
                model: workOrder.model,
                vin: workOrder.vin,
                license_plate: workOrder.license_plate,
                mileage: workOrder.mileage
            },
            parts: partsResult,
            labor: laborResult
        };
        
        // Send completion email
        const result = await emailService.sendWorkOrderCompletion(workOrderData);
        
        res.json({
            message: 'Work order completion email sent successfully',
            workOrderId: workOrderId,
            ...result
        });
        
    } catch (error) {
        console.error('Send completion email error:', error);
        res.status(500).json({ error: 'Failed to send completion email: ' + error.message });
    }
});

// Clear email configuration
app.delete('/api/email/clear', async (req, res) => {
    try {
        const success = await emailService.clearConfiguration();
        
        if (success) {
            console.log('Email configuration cleared via API');
            res.json({ 
                message: 'Email configuration cleared successfully',
                cleared: true 
            });
        } else {
            res.status(500).json({ error: 'Failed to clear email configuration' });
        }
    } catch (error) {
        console.error('Clear email configuration error:', error);
        res.status(500).json({ error: 'Error clearing email configuration: ' + error.message });
    }
});

// Check email service status
app.get('/api/email/status', async (req, res) => {
    const savedConfig = await configStore.loadEmailConfig();
    const hasPassword = await configStore.getDecryptedPassword() !== null;
    
    res.json({
        configured: emailService.isConfigured,
        shopEmail: emailService.shopEmail || null,
        shopName: emailService.shopName || null,
        hasSavedConfig: savedConfig !== null,
        savedEmail: savedConfig?.email || null,
        savedShopName: savedConfig?.shopName || null,
        hasStoredPassword: hasPassword,
        needsPassword: savedConfig !== null && !emailService.isConfigured && !hasPassword
    });
});

// Auto-load email configuration on startup
(async () => {
    try {
        await emailService.autoLoadConfiguration();
    } catch (error) {
        console.error('Error auto-loading email configuration:', error);
    }
})();

function startServer() {
    const server = app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying another port...`);
            port++;
            server.close(() => { // Close the server that failed to start
                startServer(); // Try again with the new port
            });
        } else {
            console.error('Server error:', err);
        }
    });
}

// Call startServer to begin listening
startServer();
