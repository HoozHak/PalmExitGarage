# PalmExitGarage - Professional Auto Repair Management System

**A complete, production-ready auto repair shop management system with comprehensive vehicle database, professional parts catalog, automated workflow, and database backup/restore capabilities.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/HoozHak/PalmExitGarage)

---

## 🚀 What's New in Version 1.1

### Major Features Added
- ✅ **Database Backup & Restore System** - Full backup/restore with animated progress indicators
- ✅ **Color-Coded Work Order Status** - Visual status badges (Yellow/Green/Orange/Blue/Red)
- ✅ **Smart Inventory Management** - Inventory deduction only on approval, prevents double-deduction
- ✅ **Enhanced SMTP Error Messages** - Clear, actionable email setup guidance
- ✅ **Status Legend** - Visual guide showing all work order statuses and their meanings

### Bug Fixes & Improvements
- ✅ Fixed work order status database schema compatibility
- ✅ Added missing database columns for signatures and inventory tracking
- ✅ Fixed database restore to properly replace all data
- ✅ Enhanced UI feedback during long-running operations
- ✅ Improved error messaging throughout the application

---

## 🌟 Key Features

### Core Functionality
- 💾 **Complete Database Backup/Restore** - Local backups with progress indicators
- 🚗 **Vehicle Database** - 703 vehicles (2010-2015) with expansion to 2025 available
- 🔧 **Professional Parts Catalog** - 88 parts with AutoZone business pricing
- 📊 **Work Order Management** - Complete workflow from estimate to completion
- 📧 **Email Automation** - Professional notifications with SMTP configuration
- 💰 **Inventory Tracking** - Smart deduction system with double-deduction prevention
- 🎨 **Modern UI** - React-based interface with real-time updates

### Business Features
- **Customer Management** - Complete CRM with cascade deletion
- **Vehicle Tracking** - Full service history per vehicle
- **Digital Signatures** - Capture customer approval (drawn or typed)
- **Automatic Tax Calculation** - Configurable tax rates
- **Receipt Generation** - Professional HTML email receipts
- **Status Workflow** - Track orders through complete lifecycle

---

## 📋 Quick Start

### Prerequisites
- **Node.js** 16.x or higher (Node.js 20.x LTS recommended)
- **MySQL 8.0.x** (local installation)
  - ⚠️ **Supported versions:** MySQL 8.0.35 through 8.0.40
  - ⚠️ **NOT compatible with:** MySQL 8.4.x, MySQL 9.x, or Innovation releases
  - **Recommended:** MySQL 8.0.40 (latest stable 8.0.x LTS version)
- **Windows** 10/11 (PowerShell required)

### Installation Steps

#### 1. Install MySQL (if not already installed)

⚠️ **CRITICAL: Install MySQL 8.0.x ONLY (NOT 8.4.x or 9.x)**

**Option A - Automated Installation (Recommended):**
```powershell
# Run the automated MySQL installer
.\download-mysql.ps1
```

**Option B - Manual Installation:**
1. Go to: https://dev.mysql.com/downloads/installer/
2. Download **MySQL Installer 8.0.40** (or latest 8.0.x version)
   - Click "Looking for previous GA versions?" if 8.0.x is not on main page
3. During installation:
   - Choose **"Developer Default"** or **"Server only"**
   - Set **root password** (WRITE THIS DOWN!)
   - Keep port as **3306**
   - Enable "Start MySQL at System Startup"

See `INSTALL_MYSQL_WINDOWS.md` for detailed step-by-step MySQL setup instructions.

#### 2. Clone & Setup
```bash
# Clone the repository
git clone https://github.com/HoozHak/PalmExitGarage.git
cd PalmExitGarage

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 3. Configure Database
Edit `server/config/database.js` with your MySQL credentials:
```javascript
module.exports = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'your_password',
    database: 'palmexitgarage'
};
```

#### 4. Initialize Database
```bash
cd server

# Create database schema
node migrate.js

# Seed vehicle data (2010-2015)
node seed_vehicles_2010_2015.js

# Seed parts catalog
node seed_autozone_parts.js

# Seed labor services
node seed_labor.js

# Add test customer data (optional)
node seed_test_data.js
```

#### 5. Start Application
```bash
# Terminal 1: Start backend
cd server
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

**Access the application at:** http://localhost:5174

---

## 🏗️ System Architecture

### Technology Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite | Modern UI with hot reload |
| **Backend** | Node.js + Express | RESTful API server |
| **Database** | MySQL 8.0 | Relational data storage |
| **Email** | Nodemailer | SMTP email delivery |
| **Backup** | mysql2 | Database backup/restore |

### Database Schema
```
palmexitgarage
├── customers          # Customer records
├── vehicles           # Customer vehicles
├── vehicle_reference  # Make/model/year lookup (703 vehicles)
├── parts              # Parts inventory (88 items)
├── labor              # Labor services catalog
├── work_orders        # Work orders/estimates
├── work_order_parts   # Parts used in work orders
└── work_order_labor   # Labor services in work orders
```

### Application Ports
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **MySQL Database**: localhost:3306

---

## 💼 Professional Features

### 1. Customer & Vehicle Management
- **Add/Edit/Delete Customers** - Complete CRUD operations
- **Advanced Search** - Find by name, phone, email, or ID
- **Vehicle Database Integration** - 703+ vehicles (2010-2015)
- **Service History Tracking** - Complete customer relationship history
- **Cascade Deletion** - Safe removal with confirmation
- **Data Validation** - Prevent duplicate entries and data corruption

### 2. Work Orders & Estimates

#### Status Workflow with Color Coding
```
🟡 Estimate (Yellow)    → Initial quote created
🟢 Approved (Green)     → Customer approved, inventory deducted
🟠 Started (Orange)     → Work in progress
🔵 Complete (Blue)      → Ready for customer pickup
🔴 Cancelled (Red)      → Work order cancelled
```

#### Key Features
- Professional quote generation with parts and labor
- Automatic tax calculation
- Digital signature capture (drawn or typed)
- Email receipts and completion notifications
- Print-ready work order format
- Status history tracking

### 3. Intelligent Inventory Management

#### Smart Deduction System
```
Create Estimate → Inventory NOT deducted ✅
      ↓
Approve Estimate → Inventory deducted NOW ✅
      ↓
Change Status → No additional deduction (protected) ✅
```

#### Features
- **Automatic Deduction** - Only when estimates are approved
- **Double-Deduction Prevention** - Database tracking prevents errors
- **Real-Time Updates** - Instant inventory level changes
- **Low Stock Alerts** - Visual warnings for low quantities
- **Negative Prevention** - Cannot go below zero
- **Audit Trail** - Track all inventory changes

### 4. Database Backup & Restore

#### Backup Features
- **One-Click Backup** - Create full database backups instantly
- **Local Storage** - Backups saved in `server/backups/` directory
- **Timestamped Files** - Easy identification and organization
- **Complete Data** - All tables, relationships, and data preserved
- **Manual Export** - Copy backup files for external storage

#### Restore Features
- **Visual Progress** - Animated modal shows restore status
- **Complete Replacement** - Safely drops and recreates all tables
- **Statistics Display** - Shows tables created and rows inserted
- **Success Confirmation** - Detailed completion modal
- **Safety Checks** - Confirmation required before restore

#### Backup Workflow
```
1. Navigate to Database Manager
2. Select database to backup
3. Click "Create Backup"
4. Backup saved with timestamp
5. Copy to external storage (recommended)
```

#### Restore Workflow
```
1. Place backup file in backups directory
2. Click "Restore" on backup file
3. Type "RESTORE" to confirm
4. Watch animated progress modal
5. View success statistics
6. Database fully restored ✅
```

See `DATABASE_RESTORE_FIX.md` and `DATABASE_RESTORE_UI_ENHANCEMENT.md` for detailed documentation.

### 5. Email Automation

#### Setup Requirements
1. Gmail account with 2-Step Verification enabled
2. Generate App Password (16-character code)
3. Configure in Settings → Email Configuration
4. Test email to verify setup

#### Features
- **Work Order Receipts** - Professional HTML email receipts
- **Completion Notifications** - Customer pickup alerts
- **Test Email Function** - Verify configuration works
- **Shop Branding** - Customize shop name in emails
- **Clear Error Messages** - Actionable SMTP setup guidance

#### Error Messaging
When SMTP is not configured, users see:
```
"SMTP service not setup to send email. Please go to 
Settings and setup SMTP for automatic email function 
to operate."
```

This provides:
- Clear identification of the issue
- Specific guidance on where to fix it
- Explanation of why SMTP is needed

---

## 📊 Database Content

### Vehicle Reference Database
| Make | Models | Years | Total Vehicles |
|------|--------|-------|----------------|
| Honda (incl. Crosstour) | 30+ | 2010-2015 | 703 |
| Additional Makes Available | - | 2016-2025 | Run seed_vehicles_2010_2025.js |

**Honda Crosstour Coverage:**
- 2010-2015: All trims (EX, EX-L, EX-L V6)
- Complete variant coverage
- Accurate production years

### Parts Catalog (88 Professional Parts)
| Category | Count | Brands |
|----------|-------|--------|
| **Engine** | 15 | ACDelco, Bosch, Denso |
| **Brakes** | 12 | Wagner, Raybestos, Centric |
| **Suspension** | 8 | Monroe, KYB, Moog |
| **Electrical** | 10 | Interstate, Optima, DieHard |
| **Fluids** | 8 | Mobil 1, Castrol, Valvoline |
| **Filters** | 12 | Fram, Purolator, Wix |
| **Cooling** | 8 | Gates, Dayco, Continental |
| **Ignition** | 6 | NGK, Champion, Autolite |
| **Lighting** | 5 | Sylvania, Philips, Wagner |
| **Wipers** | 4 | Bosch, Rain-X, Trico |

**Pricing:** AutoZone business/professional pricing

### Test Users (Pre-Loaded)

The system includes 2 test customers for immediate testing and demonstration:

#### Test Customer 1: John Doe
- **Email:** john.doe@example.com
- **Phone:** 555-0101
- **Address:** 123 Main St, Austin, TX 78701
- **Vehicle:** 2018 Honda Accord (Silver)
  - VIN: 1HGCV1F30JA123456
  - License: ABC1234
  - Mileage: 45,000
  - Engine: 2.0L Turbo
  - Transmission: Automatic
  - Notes: Regular maintenance customer

#### Test Customer 2: Jane Smith
- **Email:** jane.smith@example.com
- **Phone:** 555-0102
- **Address:** 456 Oak Ave, Austin, TX 78702
- **Vehicle:** 2020 Toyota RAV4 (Blue)
  - VIN: 2T3P1RFV8LC123789
  - License: XYZ5678
  - Mileage: 28,000
  - Engine: 2.5L
  - Transmission: Automatic
  - Notes: New customer - first visit

**To reseed test data:**
```bash
cd server
node seed_test_data.js
```

---

## 📁 Project Structure

```
PalmExitGarage/
├── frontend/                           # React Application
│   ├── src/
│   │   ├── components/                # React components
│   │   │   ├── Navigation.jsx         # Main navigation
│   │   │   ├── ExistingCustomer.jsx   # Customer management
│   │   │   ├── WorkOrderDetail.jsx    # Work order details
│   │   │   ├── WorkOrderForm.jsx      # Create work orders
│   │   │   ├── DatabaseManager.jsx    # Backup/restore UI ⭐ NEW
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── WorkOrderManagement.jsx # Work order list
│   │   │   └── ...
│   │   ├── App.jsx                    # Main app component
│   │   └── main.jsx                   # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                            # Node.js Backend
│   ├── config/
│   │   └── database.js                # MySQL configuration
│   ├── services/
│   │   ├── emailService.js            # Email functionality
│   │   └── backupService.js           # Backup/restore ⭐ NEW
│   ├── utils/
│   │   └── configStore.js             # Configuration storage
│   ├── migrations/                    # Database migrations
│   │   ├── fix_work_orders_schema.js  # Status fix ⭐ NEW
│   │   ├── restore_estimate_inventory.js # Inventory fix ⭐ NEW
│   │   └── ...
│   ├── backups/                       # Database backups ⭐ NEW
│   ├── index.js                       # Main server file
│   ├── migrate.js                     # Schema setup
│   ├── seed_vehicles_2010_2015.js     # Vehicle data
│   ├── seed_autozone_parts.js         # Parts catalog
│   ├── seed_labor.js                  # Labor services
│   └── package.json
│
├── Documentation/                     # ⭐ NEW - Comprehensive guides
│   ├── FIXES_SUMMARY_2025-10-02.md    # All fixes applied
│   ├── WORK_ORDER_STATUS_FIX.md       # Status system fix
│   ├── STATUS_COLOR_REFERENCE.md      # Color coding guide
│   ├── INVENTORY_DEDUCTION_FIX.md     # Inventory timing fix
│   ├── DATABASE_RESTORE_FIX.md        # Restore functionality
│   ├── DATABASE_RESTORE_UI_ENHANCEMENT.md # UI improvements
│   ├── SMTP_ERROR_MESSAGING_FIX.md    # Error messaging
│   ├── BACKUP_RESTORE_GUIDE.md        # User guide
│   ├── BACKUP_QUICK_START.txt         # Quick reference
│   ├── MYSQL_SETUP_GUIDE.md           # MySQL installation
│   └── INSTALL_MYSQL_WINDOWS.md       # Detailed MySQL setup
│
├── README.md                          # This file
├── LICENSE                            # MIT License
└── .gitignore                         # Git ignore rules
```

---

## 🔧 Configuration

### Database Connection
Edit `server/config/database.js`:
```javascript
module.exports = {
    host: 'localhost',      // MySQL host
    port: 3306,             // MySQL port
    user: 'root',           // MySQL user
    password: 'your_password', // MySQL password
    database: 'palmexitgarage' // Database name
};
```

### Email Configuration (In-App)
1. Navigate to **Settings**
2. Click **Email Configuration**
3. Enter Gmail address
4. Enter App Password (not regular password)
5. Set shop name
6. Click **Test Email** to verify
7. Click **Save Configuration**

### Environment Variables (Optional)
Create `.env` file in server directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=palmexitgarage
PORT=5000
```

---

## 🛠️ Development

### Available Scripts

#### Backend (server/)
```bash
npm start              # Start production server
npm run dev            # Start with hot reload (nodemon)
npm run migrate        # Create database schema
npm run seed-vehicles  # Load vehicle database
npm run seed-labor     # Load labor services
```

#### Frontend (frontend/)
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

### Database Migrations
```bash
cd server

# Run specific migration
node migrations/fix_work_orders_schema.js
node migrations/restore_estimate_inventory.js

# Create new migration
# 1. Create file in migrations/
# 2. Follow existing migration pattern
# 3. Test thoroughly before running
```

---

## 🔐 Security Features

### Data Protection
- ✅ **Parameterized Queries** - SQL injection prevention
- ✅ **Input Validation** - Sanitized user input
- ✅ **CORS Protection** - Configured API endpoints
- ✅ **Environment Variables** - Secure credential storage
- ✅ **Cascade Deletion Protection** - Confirmation required
- ✅ **App Password Support** - Gmail security compliance

### Data Safety
- ✅ **Backup System** - Regular database backups
- ✅ **Confirmation Prompts** - Prevent accidental deletion
- ✅ **Foreign Key Constraints** - Maintain data integrity
- ✅ **Audit Logging** - Server logs all operations
- ✅ **Transaction Support** - Database consistency

---

## 📚 Documentation

### User Guides
- `BACKUP_QUICK_START.txt` - Quick backup/restore reference
- `BACKUP_RESTORE_GUIDE.md` - Complete backup guide
- `MYSQL_SETUP_GUIDE.md` - MySQL installation guide
- `INSTALL_MYSQL_WINDOWS.md` - Detailed Windows MySQL setup

### Technical Documentation
- `FIXES_SUMMARY_2025-10-02.md` - All fixes in version 1.1
- `WORK_ORDER_STATUS_FIX.md` - Status system documentation
- `STATUS_COLOR_REFERENCE.md` - Color coding reference
- `INVENTORY_DEDUCTION_FIX.md` - Inventory management details
- `DATABASE_RESTORE_FIX.md` - Restore functionality details
- `DATABASE_RESTORE_UI_ENHANCEMENT.md` - UI improvement details
- `SMTP_ERROR_MESSAGING_FIX.md` - Error handling improvements

---

## 🎯 Target Users

- **Small to Medium Auto Repair Shops** - Complete management solution
- **Independent Mechanics** - Professional workflow tools
- **Mobile Repair Services** - Portable, cloud-ready system
- **Fleet Maintenance Operations** - Multi-vehicle tracking
- **Automotive Service Centers** - Full-featured repair management

---

## 📄 License

This project is licensed under the **MIT License**.

**Copyright © 2025 Coty O'Dea (GitHub: [HoozHak](https://github.com/HoozHak))**

---

## 📞 Support

**Repository**: [https://github.com/HoozHak/PalmExitGarage](https://github.com/HoozHak/PalmExitGarage)  
**Issues**: [https://github.com/HoozHak/PalmExitGarage/issues](https://github.com/HoozHak/PalmExitGarage/issues)  
**Author**: Coty O'Dea ([@HoozHak](https://github.com/HoozHak))

---

**Ready to streamline your auto repair business?**  
**Get started today with PalmExitGarage!**

© 2025 PalmExitGarage - Professional Auto Repair Shop Management System  
Version 1.1.0 | Built with ❤️ for the automotive industry
