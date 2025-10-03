# PalmExitGarage - Changelog

## Version 1.1.0 - Inventory Management Release (2025-09-30)

### Major New Features

#### Intelligent Inventory Management System
- Automatic Parts Deduction - Parts are automatically deducted from inventory when work orders are approved
- Double-Deduction Prevention - Database tracking prevents inventory from being deducted multiple times
- Status Change Tracking - System monitors work order status changes and only deducts on "Estimate" to "Approved" transition
- Inventory Database Flag - New `inventory_deducted` column in work_orders table tracks deduction status
- Zero-Inventory Protection - Inventory quantities cannot go below zero (uses GREATEST(0, quantity - deduction))

#### User Interface Improvements
- Email Settings Cleanup - Removed duplicate "detailed setup guide" buttons for cleaner interface
- Shop Name Default Removed - Shop name field now starts blank instead of defaulting to "Palm Exit Garage"
- Input Field Overflow Fix - Added proper CSS box-sizing to prevent input fields from overflowing containers
- Professional Layout - All form fields now properly align within their containers

#### Database Schema Enhancements
- New Migration System - Added migrations folder with structured database updates
- Inventory Deduction Migration - `add_inventory_deducted_column.js` adds tracking to existing work orders
- Backwards Compatibility - Existing approved work orders are automatically marked as having inventory deducted

### Technical Improvements

#### Backend API Enhancements
- Enhanced Status Update Endpoint - `PUT /api/work-orders/:id/status` now handles inventory deduction logic
- Inventory Deduction Function - New `deductInventoryForWorkOrder()` function with comprehensive error handling
- Smart Status Detection - System checks both current and new status before deducting inventory
- Detailed API Responses - Status updates now include `inventory_deducted: true/false` in response

#### Database Improvements
- Clean Sample Data - Fresh database with 4 sample customers, 4 vehicles, 0 work orders
- Email Configuration Cleared - No default SMTP settings, ready for user configuration
- Parts Inventory Reset - All parts properly stocked with appropriate quantities

### User Experience Enhancements
- Clear Visual Feedback - Users receive confirmation when inventory is deducted
- Error Handling - Graceful handling of inventory deduction failures with detailed error messages
- Professional Workflow - Seamless transition from estimate creation to approval with automatic inventory management

---

## Version 1.0.0 - Database Management Release (2025-09-29)

### Major New Features

#### Database Management System
- Professional Database Administration Interface added to Inventory Management
- Selective Database Deletion - Choose specific databases to clear:
  - Customers (removes customers and all associated data)
  - Vehicles (removes vehicles and related work orders)
  - Parts Inventory (clears parts catalog)
  - Labor & Pricing (clears labor operations)
  - Work Orders (removes all work order history)
  - Tax Settings (clears tax configuration)

#### Advanced Safety Features
- Dual-Confirmation Process - Two separate confirmation dialogs
- Smart Dependency Management - Respects database relationships and foreign keys
- Real-Time Status Display - Shows current record counts for all databases
- Visual Warning System - Professional "DANGER ZONE" interface with clear warnings

#### Technical Enhancements
- Backend API Endpoints: 
  - `GET /api/database/counts` - Retrieve database record counts
  - `POST /api/database/delete` - Secure database deletion with validation
- Frontend UI Components - Professional database management interface
- Security Controls - Requires typing "DELETE_CONFIRMED" for final confirmation

### System Improvements

#### Port Configuration Updates
- Frontend Port: Updated from 3000 to 5174 (Vite default)
- Updated Installation Scripts - All installer files now reference correct ports
- Fixed Shortcuts - Desktop and Start Menu shortcuts use correct URLs

#### Documentation Updates
- Main README.md - Added Database Management feature documentation
- Deployment README.md - Updated with new features and correct ports
- Installation Scripts - Updated descriptions and port references

### Package Updates
- Frontend Package (`frontend/package.json`):
  - Version bumped to 1.0.0
  - Added descriptive name and description
- Backend Package (`server/package.json`):
  - Version bumped to 1.0.0  
  - Added Database Management description

### Installation Improvements
- INSTALL_PALMEXITGARAGE.bat - Updated feature descriptions and port references
- START_PALMEXITGARAGE.bat - Fixed port configuration for proper browser opening
- create_shortcuts.bat - Updated shortcut URLs to use correct port

---

## Previous Versions

### Version 0.1.0 - Initial Release
- Complete auto repair shop management system
- 6,057+ vehicle database (2010-2025)
- 88 professional parts with AutoZone pricing
- Work order management and customer tracking
- Email automation system
- Professional installation package

---

## Installation Notes

- Existing Installations: No database migration required
- New Installations: Use the updated INSTALL_PALMEXITGARAGE.bat
- Browser Access: Application now available at http://localhost:5174
- Compatibility: All existing features remain fully functional

---

## Security Advisory

The new Database Management feature includes powerful deletion capabilities. Please:

1. Use with Extreme Caution - Deletions are permanent and cannot be undone
2. Backup Important Data - Export data before performing any deletions
3. Follow Confirmation Prompts - The dual-confirmation system is designed for your protection
4. Test on Development Data - Familiarize yourself with the system using test data first

---

© 2025 PalmExitGarage - Professional Auto Repair Shop Management System
