const mysql = require('mysql2');
const dbConfig = require('../config/database');
require('dotenv').config();

// Database connection
const db = mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
});

const restoreEstimateInventory = async () => {
    console.log('🔄 Checking for work orders in "Estimate" status that may have had inventory deducted incorrectly...');
    console.log('');
    
    try {
        // Find all work orders with "Estimate" status
        const estimateWorkOrders = await new Promise((resolve, reject) => {
            db.query(
                `SELECT work_order_id, status, inventory_deducted 
                 FROM work_orders 
                 WHERE status = 'Estimate'`,
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
        
        console.log(`📊 Found ${estimateWorkOrders.length} work order(s) with "Estimate" status`);
        
        if (estimateWorkOrders.length === 0) {
            console.log('✅ No estimate work orders found. Nothing to restore.');
            db.end();
            return;
        }
        
        // For each estimate work order, check if it has parts and restore inventory
        let totalRestored = 0;
        let workOrdersProcessed = 0;
        
        for (const workOrder of estimateWorkOrders) {
            console.log(`\n📋 Processing Work Order #${workOrder.work_order_id}...`);
            
            // Get parts for this work order
            const parts = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT wop.part_id, wop.quantity, p.brand, p.item, p.quantity_on_hand
                     FROM work_order_parts wop
                     JOIN parts p ON wop.part_id = p.part_id
                     WHERE wop.work_order_id = ?`,
                    [workOrder.work_order_id],
                    (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    }
                );
            });
            
            if (parts.length === 0) {
                console.log('   ℹ️  No parts in this work order');
                continue;
            }
            
            console.log(`   📦 Found ${parts.length} part(s) in this estimate`);
            
            // Restore inventory for each part
            for (const part of parts) {
                try {
                    await new Promise((resolve, reject) => {
                        db.query(
                            'UPDATE parts SET quantity_on_hand = quantity_on_hand + ? WHERE part_id = ?',
                            [part.quantity, part.part_id],
                            (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            }
                        );
                    });
                    
                    const newQuantity = part.quantity_on_hand + part.quantity;
                    console.log(`   ✅ Restored ${part.quantity} units of ${part.brand} ${part.item} (${part.quantity_on_hand} → ${newQuantity})`);
                    totalRestored++;
                } catch (err) {
                    console.error(`   ❌ Error restoring part ${part.part_id}:`, err.message);
                }
            }
            
            // Update the work order to mark inventory as not deducted
            await new Promise((resolve, reject) => {
                db.query(
                    'UPDATE work_orders SET inventory_deducted = FALSE WHERE work_order_id = ?',
                    [workOrder.work_order_id],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
            
            console.log(`   ✓ Work Order #${workOrder.work_order_id} marked as inventory NOT deducted`);
            workOrdersProcessed++;
        }
        
        console.log('');
        console.log('═══════════════════════════════════════════════');
        console.log('✅ Inventory Restoration Complete!');
        console.log('═══════════════════════════════════════════════');
        console.log(`📊 Work Orders Processed: ${workOrdersProcessed}`);
        console.log(`📦 Parts Inventory Restored: ${totalRestored}`);
        console.log('');
        console.log('💡 Summary:');
        console.log('   - Inventory has been restored for all parts in "Estimate" work orders');
        console.log('   - Work orders marked with inventory_deducted = FALSE');
        console.log('   - Inventory will only be deducted when status changes to "Approved"');
        console.log('');
        
    } catch (err) {
        console.error('❌ Error during inventory restoration:', err.message);
    } finally {
        db.end();
    }
};

// Connect and run restoration
db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        console.error('Please ensure MySQL is running and database credentials are correct.');
        return;
    }
    console.log('✅ Connected to MySQL database');
    console.log(`📊 Database: ${dbConfig.database}`);
    console.log('');
    restoreEstimateInventory();
});
