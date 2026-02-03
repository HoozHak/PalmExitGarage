# Inventory Deduction Fix - Documentation

## Issue Summary

**Problem:** Parts inventory was being deducted immediately when a work order (estimate) was created, instead of being deducted only when the work order status changed from "Estimate" to "Approved".

**Impact:** This caused inventory levels to be inaccurate, showing lower quantities than actually available, since estimates that were never approved still had their inventory deducted.

## Root Cause

In `server/index.js`, the `POST /api/work-orders` endpoint (line 1223) contained logic that would deduct inventory during work order creation based on an `is_estimate` flag. This was incorrect behavior.

### Original Problematic Code (lines 1255-1285):
```javascript
// If this work order is not just an estimate, deduct parts from inventory
// We'll check the is_estimate flag from the request body
const isEstimate = req.body.is_estimate || false;
if (!isEstimate) {
    // Deduct inventory for each part
    parts.forEach(part => {
        const inventoryQuery = 'UPDATE parts SET quantity_on_hand = GREATEST(0, quantity_on_hand - ?) WHERE part_id = ?';
        // ... deduction logic
    });
}
```

## Solution Implemented

### 1. ✅ Fixed Work Order Creation Endpoint

**File:** `server/index.js` (lines 1255-1268)

**Changes:**
- Removed all inventory deduction logic from the work order creation endpoint
- Added clear comment explaining that inventory will be deducted later when status changes to "Approved"
- Added logging to track that parts are added but inventory is NOT deducted yet

**New Code:**
```javascript
// Insert parts (but do NOT deduct inventory yet)
// Inventory will only be deducted when status changes from Estimate to Approved
if (parts && parts.length > 0) {
    const partQuery = 'INSERT INTO work_order_parts (work_order_id, part_id, quantity, cost_cents) VALUES ?';
    const partValues = parts.map(p => [work_order_id, p.part_id, p.quantity, p.cost_cents]);
    promises.push(new Promise((resolve, reject) => {
        db.query(partQuery, [partValues], (err) => {
            if (err) reject(err);
            else resolve();
        });
    }));
    
    console.log(`Work order #${work_order_id} created with ${parts.length} parts (inventory NOT deducted - will deduct when approved)`);
}
```

### 2. ✅ Status Update Endpoint (Already Working Correctly)

**File:** `server/index.js` (lines 1425-1507)

The status update endpoint was already correctly configured to:
- Check if status is changing from "Estimate" to "Approved"
- Check if inventory has already been deducted (via `inventory_deducted` flag)
- Only deduct inventory when both conditions are met
- Set `inventory_deducted = TRUE` to prevent double-deduction

**Key Logic (line 1452):**
```javascript
const isApprovingEstimate = currentStatus === 'Estimate' && status === 'Approved' && !inventoryAlreadyDeducted;
```

### 3. ✅ Created Inventory Restoration Script

**File:** `migrations/restore_estimate_inventory.js`

**Purpose:** Restore inventory that was incorrectly deducted for existing work orders in "Estimate" status.

**What it does:**
1. Finds all work orders with status = "Estimate"
2. For each work order, gets the parts and their quantities
3. Restores inventory by adding the quantities back to `parts.quantity_on_hand`
4. Marks work orders with `inventory_deducted = FALSE`

**Run Results:**
```
✅ Work Orders Processed: 2
📦 Parts Inventory Restored: 2
```

## Correct Inventory Workflow

### Status Flow with Inventory Management:

```
┌──────────────────────────────────────────────────────┐
│ 1. ESTIMATE CREATED                                  │
│    Status: "Estimate"                                │
│    Inventory: NOT DEDUCTED ✅                        │
│    inventory_deducted: FALSE                         │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ Customer Approves
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 2. STATUS CHANGED TO "APPROVED"                      │
│    Status: "Estimate" → "Approved"                   │
│    Inventory: DEDUCTED NOW ✅                        │
│    inventory_deducted: TRUE                          │
│    Action: deductInventoryForWorkOrder() called      │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ Work Begins
                 │
                 ▼
┌──────────────────────────────────────────────────────┐
│ 3. FURTHER STATUS CHANGES                            │
│    Status: "Started" / "Complete" / etc.             │
│    Inventory: NO CHANGE (already deducted)           │
│    inventory_deducted: TRUE (prevents re-deduction)  │
└──────────────────────────────────────────────────────┘
```

## Testing the Fix

### Test Case 1: Create New Estimate
1. Create a new work order with parts
2. **Expected:** Inventory should NOT be deducted
3. **Verify:** Check `parts.quantity_on_hand` - should remain unchanged
4. **Verify:** Check `work_orders.inventory_deducted` - should be FALSE

### Test Case 2: Approve Estimate
1. Change status from "Estimate" to "Approved"
2. **Expected:** Inventory SHOULD be deducted now
3. **Verify:** Check `parts.quantity_on_hand` - should decrease by work order quantity
4. **Verify:** Check `work_orders.inventory_deducted` - should be TRUE

### Test Case 3: Subsequent Status Changes
1. Change status from "Approved" to "Started" or "Complete"
2. **Expected:** Inventory should NOT change (already deducted)
3. **Verify:** Check `parts.quantity_on_hand` - should remain the same
4. **Verify:** Check `work_orders.inventory_deducted` - should remain TRUE

### Test Case 4: Multiple Approvals (Edge Case)
1. Try to approve an already-approved work order
2. **Expected:** Inventory should NOT be deducted again
3. **Protection:** `inventory_deducted` flag prevents double-deduction

## Files Modified

### Backend Code
- ✅ `server/index.js` - Fixed work order creation endpoint (lines 1255-1268)

### Migration Scripts
- ✅ `migrations/restore_estimate_inventory.js` - NEW: Restores incorrectly deducted inventory

### Documentation
- ✅ `INVENTORY_DEDUCTION_FIX.md` - This file

## Database Schema

### Relevant Columns

**work_orders table:**
- `status` ENUM('Estimate', 'Approved', 'Started', 'Complete', 'Cancelled')
- `inventory_deducted` BOOLEAN DEFAULT FALSE - Tracks if inventory has been deducted

**parts table:**
- `quantity_on_hand` INT - Current inventory quantity

**work_order_parts table:**
- `quantity` INT - Quantity of part used in this work order

## Benefits of This Fix

1. ✅ **Accurate Inventory Tracking** - Inventory levels now reflect actual availability
2. ✅ **Prevents Over-Deduction** - No double-deduction when status changes multiple times
3. ✅ **Proper Estimate Handling** - Estimates don't affect inventory until approved
4. ✅ **Audit Trail** - `inventory_deducted` flag provides clear tracking
5. ✅ **Data Integrity** - Historical data corrected via restoration script

## Future Enhancements

Consider implementing:
- **Inventory History Log** - Track all inventory changes with timestamps
- **Low Stock Warnings** - Alert when creating estimates would exceed available inventory
- **Inventory Reservation** - Optionally "reserve" inventory for approved estimates
- **Cancellation Handling** - Automatically restore inventory when work orders are cancelled
- **Batch Inventory Operations** - Optimize inventory updates for large work orders

## Rollback Plan (If Needed)

If this change needs to be rolled back:

1. **Restore previous code** from git history:
   ```bash
   git checkout <previous-commit> server/index.js
   ```

2. **Note:** The restoration script can be re-run safely if needed

3. **Database state:** The `inventory_deducted` flag will remain and continue to prevent double-deduction

## Verification Commands

### Check Current Inventory Levels:
```sql
SELECT part_id, brand, item, quantity_on_hand 
FROM parts 
ORDER BY quantity_on_hand ASC;
```

### Check Work Orders with Inventory Status:
```sql
SELECT work_order_id, status, inventory_deducted, created_at
FROM work_orders 
ORDER BY work_order_id DESC;
```

### Check Parts in Estimates:
```sql
SELECT wo.work_order_id, wo.status, wo.inventory_deducted,
       wop.part_id, wop.quantity, p.brand, p.item, p.quantity_on_hand
FROM work_orders wo
JOIN work_order_parts wop ON wo.work_order_id = wop.work_order_id
JOIN parts p ON wop.part_id = p.part_id
WHERE wo.status = 'Estimate'
ORDER BY wo.work_order_id;
```

---

**Fix Date:** 2025-10-02  
**Status:** ✅ COMPLETED  
**Migration Run:** ✅ restore_estimate_inventory.js executed successfully  
**Impact:** 2 work orders corrected, 2 parts inventory restored
