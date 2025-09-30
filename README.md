# PalmExitGarage - Professional Auto Repair Management System

**A complete, portable auto repair shop management system with comprehensive vehicle database, professional parts catalog, and automated workflow.**


---

## Key Features

- Portable installation runs on any Windows machine
- Complete database: 6,057 vehicles (2010-2025) and 88 professional parts
- AutoZone business pricing with Honda Crosstour coverage
- Automated installer handles Node.js, Docker, and all dependencies
- Automatic inventory management with intelligent deduction system
- Automatic customer email notifications
- Modern React-based web interface

---

## Quick Start

### Option 1: Portable Installation (Recommended)
1. Copy the `PalmExitGarage` folder to your computer
2. **Right-click** `deployment\INSTALL_PALMEXITGARAGE.bat`
3. Select **"Run as administrator"**
4. Follow the prompts - everything installs automatically!
5. Use the desktop shortcut to start PalmExitGarage

### Option 2: Development Setup
```bash
# Clone and setup
git clone <repository-url>
cd PalmExitGarage

# Start database
docker-compose up -d

# Install dependencies
cd server && npm install
cd ../frontend && npm install

# Start services
cd ../server && npm start
cd ../frontend && npm run dev
```

**Access the application at:** http://localhost:5174

---

## System Architecture

### Technology Stack
- **Frontend**: React 18 + Vite + Modern CSS
- **Backend**: Node.js + Express + RESTful APIs
- **Database**: MySQL 8.0 in Docker container
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Docker + Portable Windows installers

### Database Content
| Component | Count | Description |
|-----------|-------|-------------|
| **Vehicles** | 6,057 | Complete 2010-2025 vehicle database |
| **Honda Crosstour** | 24 | All variants (2010-2015) |
| **Professional Parts** | 88 | AutoZone business pricing |
| **Brands** | 27 | Major automotive manufacturers |
| **Categories** | 11 | Engine, Brakes, Suspension, etc. |

---

## Professional Features

### Customer & Vehicle Management
- Complete CRUD operations: Add, view, edit, and delete customers
- Cascade deletion: Removing customers automatically deletes associated vehicles and work orders
- Advanced search: Find customers by name, phone, email, or ID
- Vehicle integration: Comprehensive make/model/year lookup from 6,000+ database
- Service history: Complete tracking of customer relationship and work history
- Data integrity: Confirmation prompts prevent accidental data loss

### Work Orders & Estimates
- Professional work order creation with parts and labor
- Status workflow: `Estimate → Approved → Started → Complete`
- Automatic inventory deduction when estimates are approved
- Double-deduction prevention with database tracking
- Digital signature capture (drawn or typed)
- Automatic tax calculations and professional receipts
- Print and email functionality

### Inventory & Parts Management
- 88 professional parts with AutoZone business pricing
- Real-time inventory tracking and stock management
- Automatic inventory deduction when work orders are approved
- Intelligent deduction prevention (no double-deduction)
- 11 categories: Engine, Brakes, Suspension, Electrical, Fluids, etc.
- Quality brands: ACDelco, Bosch, Wagner, Monroe, Mobil 1, Interstate
- Database management: Professional database administration with selective deletion capabilities

### Email Automation
- Automatic notifications when work orders are completed
- Professional HTML email templates with shop branding
- Gmail SMTP integration with App Password support
- Receipt generation and delivery

### Intelligent Inventory Management
- Automatic parts deduction when work orders are approved
- Smart tracking prevents double-deduction of inventory
- Database-level tracking of inventory deduction status
- Real-time inventory updates and stock management
- Negative inventory prevention (minimum quantity: 0)

### Database Management
- Professional database administration with secure deletion controls
- Selective database deletion - Choose specific tables to clear (Customers, Vehicles, Parts, etc.)
- Dual-confirmation safety - Multiple confirmation prompts prevent accidental data loss
- Smart relationship handling - Respects foreign key constraints and dependent data
- Complete database status - Real-time record counts and system overview
- Automated backup system ready (Google Drive integration planned for future release)

### Comprehensive Vehicle Database
- 6,057 vehicle combinations covering 2010-2025
- 27 major brands: Honda, Toyota, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, and more
- Honda Crosstour: Complete coverage (2010-2015) including EX, EX-L, EX-L V6
- Accurate production year tracking and discontinued model handling

---

## Target Users

- **Small to medium auto repair shops**
- **Independent mechanics**
- **Mobile repair services**
- **Fleet maintenance operations**
- **Automotive service centers**

---

## Usage Workflow

### Customer & Work Order Management
1. **Customer Operations**: Add, edit, search, or delete customers with full data validation
2. **Vehicle Management**: Add vehicles from 6,000+ database, edit details, automatic deletion with customer
3. **Work Order Creation**: Build estimates with professional parts catalog + labor services
4. **Status Workflow**: Track progress through Estimate → Approved → Started → Complete
5. **Inventory Control**: Automatic parts deduction when estimates are approved, with prevention of double-deduction
6. **Data Safety**: Cascade deletion with confirmation - removing customers cleans up all related data
7. **Email Automation**: Customers receive professional pickup notifications when work is complete

### Professional Parts Selection
- Browse by category (Engine, Brakes, Suspension, etc.)
- Search by brand, part number, or description
- Realistic AutoZone business pricing
- Automatic cost calculations and markup

---

## Project Structure

```
PalmExitGarage/
├── deployment/                    # Portable Installation System
│   ├── INSTALL_PALMEXITGARAGE.bat   # Main installer
│   ├── START_PALMEXITGARAGE.bat     # Application launcher
│   ├── database_backup/             # Complete database backup
│   ├── install_nodejs.bat           # Node.js auto-installer
│   ├── install_docker.bat           # Docker Desktop installer
│   └── README.md                    # Installation guide
├── frontend/                      # React Application
│   ├── src/                        # React components and logic
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Build configuration
├── server/                        # Node.js Backend
│   ├── index.js                    # Main server file
│   ├── config/database.js          # Database configuration
│   ├── migrate.js                  # Database schema setup
│   ├── migrations/                 # Database migration scripts
│   ├── seed_comprehensive_vehicles.js  # Vehicle database seeder
│   ├── seed_autozone_parts.js      # Parts catalog seeder
│   └── package.json               # Backend dependencies
├── docker-compose.yml             # 🐳 Database container config
├── LICENSE                        # MIT License
├── README.md                      # This file
└── .gitignore                     # Git ignore rules
```

---

## Configuration

### Database Settings
- **Database**: `palmexitgarage` 
- **Container**: `palmexitgarage-db`
- **Volume**: `palmexitgarage_db_data`
- **Port**: 3308 (external) → 3306 (internal)

### Application Ports
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **Database**: localhost:3308

### Email Configuration
1. Go to **Email Settings** in the application
2. Enter Gmail address and App Password
3. Configure shop name and branding
4. Test email functionality

---

## Deployment Options

### 1. Portable Installation (End Users)
- Complete Windows installer with all dependencies
- Downloads and installs Node.js and Docker Desktop
- Sets up database with all professional data
- Creates desktop shortcuts and Start Menu entries

### 2. Development Environment
- Docker-based MySQL database
- Hot-reload development servers
- Separate frontend and backend processes

### 3. Production Deployment
- Docker containerization ready
- Environment variable configuration
- SSL/HTTPS support ready
- Load balancer compatible

---

## Security & Data Safety Features

### Security
- SQL injection prevention with parameterized queries
- Input validation and sanitization on all forms
- Secure email configuration with Gmail App Password support
- CORS protection for API endpoints
- Environment variables for sensitive data protection

### Data Safety
- Cascade deletion protection - Smart deletion of related records
- Confirmation prompts - Users must type "DELETE" to confirm customer removal
- Data integrity - Foreign key constraints prevent orphaned records
- Audit logging - Server logs all customer deletion activities
- Backup integration - Database export includes all professional data

---

## Support & Documentation

### Installation Support
- See `deployment/README.md` for detailed installation instructions
- Troubleshooting guide included in installer package
- System requirements and compatibility information

### Development
- Clean, documented codebase with modern practices
- RESTful API architecture
- Component-based React frontend
- Professional database design

---

## What Makes This Special

1. Complete Solution: Not just a framework - a complete, working auto repair system
2. Professional Data: Real AutoZone pricing, comprehensive vehicle database
3. Truly Portable: One installer handles everything from Node.js to final setup
4. Industry Ready: Built for real auto repair shops with realistic data
5. Modern Stack: Latest technologies with professional development practices
6. Business Automation: Automatic customer communications and workflow

---

## License

This project, [Palm Exit Garage](https://github.com/HoozHak/PalmExitGarage), is licensed under the MIT License.  

Copyright (c) 2025 Coty O'Dea (GitHub: [HoozHak](https://github.com/HoozHak))

You are free to use, modify, and distribute this project, but **please give proper attribution** by linking back to this repository and crediting the author.

---

Ready to streamline your auto repair business? Get started with the portable installer.

© 2025 PalmExitGarage - Professional Auto Repair Shop Management System
