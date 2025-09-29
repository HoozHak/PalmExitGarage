# PalmExitGarage - Changelog

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
