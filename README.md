# PalmExitGarage - Professional Auto Repair Management System

🚗 **A complete, portable auto repair shop management system with comprehensive vehicle database, professional parts catalog, and automated workflow.**

[![Professional Grade](https://img.shields.io/badge/Grade-Professional-blue.svg)]()
[![Database](https://img.shields.io/badge/Database-6,057_Vehicles-green.svg)]()
[![Parts](https://img.shields.io/badge/Parts-88_AutoZone-orange.svg)]()
[![Portable](https://img.shields.io/badge/Installation-Portable-purple.svg)]()

---

## 🎯 **Key Highlights**

- **✅ Ready-to-Deploy**: Portable installation runs on any Windows machine
- **🗄️ Complete Database**: 6,057 vehicles (2010-2025) + 88 professional parts
- **🏭 Professional Grade**: AutoZone business pricing, Honda Crosstour included
- **🚀 One-Click Install**: Automated installer handles Node.js, Docker, everything
- **📧 Email Automation**: Automatic customer notifications when work is complete
- **📱 Modern Interface**: React-based responsive design

---

## 🚀 **Quick Start - For End Users**

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

**Access the application at:** http://localhost:3000

---

## 🏗️ **System Architecture**

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

## 💼 **Professional Features**

### 👥 **Customer & Vehicle Management**
- Complete customer profiles with contact information
- Vehicle database with comprehensive make/model/year lookup
- Service history tracking and customer relationship management
- Advanced search and filtering capabilities

### 🔧 **Work Orders & Estimates**
- Professional work order creation with parts and labor
- Status workflow: `Estimate → Approved → Started → Complete`
- Digital signature capture (drawn or typed)
- Automatic tax calculations and professional receipts
- Print and email functionality

### 📦 **Inventory & Parts Management**
- **88 Professional Parts** with AutoZone business pricing
- Real-time inventory tracking and stock management
- **11 Categories**: Engine, Brakes, Suspension, Electrical, Fluids, etc.
- **Quality Brands**: ACDelco, Bosch, Wagner, Monroe, Mobil 1, Interstate

### 📧 **Email Automation**
- **Automatic notifications** when work orders are completed
- Professional HTML email templates with shop branding
- Gmail SMTP integration with App Password support
- Receipt generation and delivery

### 🚗 **Comprehensive Vehicle Database**
- **6,057 vehicle combinations** covering 2010-2025
- **27 major brands**: Honda, Toyota, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, and more
- **Honda Crosstour**: Complete coverage (2010-2015) including EX, EX-L, EX-L V6
- Accurate production year tracking and discontinued model handling

---

## 🎯 **Target Users**

- ✅ **Small to medium auto repair shops**
- ✅ **Independent mechanics**
- ✅ **Mobile repair services**
- ✅ **Fleet maintenance operations**
- ✅ **Automotive service centers**

---

## 📋 **Usage Workflow**

### Creating Work Orders
1. **Customer Management**: Add new or search existing customers
2. **Vehicle Addition**: Select from 6,000+ vehicle database
3. **Estimate Creation**: Add parts from professional catalog + labor
4. **Status Tracking**: Move through approval → work → completion
5. **Automatic Notifications**: Customer receives pickup email when complete

### Professional Parts Selection
- Browse by category (Engine, Brakes, Suspension, etc.)
- Search by brand, part number, or description
- Realistic AutoZone business pricing
- Automatic cost calculations and markup

---

## 📁 **Project Structure**

```
PalmExitGarage/
├── deployment/                    # 🚀 Portable Installation System
│   ├── INSTALL_PALMEXITGARAGE.bat   # Main installer
│   ├── START_PALMEXITGARAGE.bat     # Application launcher
│   ├── database_backup/             # Complete database backup
│   ├── install_nodejs.bat           # Node.js auto-installer
│   ├── install_docker.bat           # Docker Desktop installer
│   └── README.md                    # Installation guide
├── frontend/                      # 📱 React Application
│   ├── src/                        # React components and logic
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Build configuration
├── server/                        # 🖥️ Node.js Backend
│   ├── index.js                    # Main server file
│   ├── config/database.js          # Database configuration
│   ├── migrate.js                  # Database schema setup
│   ├── seed_comprehensive_vehicles.js  # Vehicle database seeder
│   ├── seed_autozone_parts.js      # Parts catalog seeder
│   └── package.json               # Backend dependencies
├── docker-compose.yml             # 🐳 Database container config
├── README.md                      # This file
└── .gitignore                     # Git ignore rules
```

---

## 🔧 **Configuration**

### Database Settings
- **Database**: `palmexitgarage` 
- **Container**: `palmexitgarage-db`
- **Volume**: `palmexitgarage_db_data`
- **Port**: 3308 (external) → 3306 (internal)

### Application Ports
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:3308

### Email Configuration
1. Go to **Email Settings** in the application
2. Enter Gmail address and App Password
3. Configure shop name and branding
4. Test email functionality

---

## 🚢 **Deployment Options**

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

## 🔐 **Security Features**

- ✅ SQL injection prevention with parameterized queries
- ✅ Input validation and sanitization
- ✅ Secure email configuration with App Passwords
- ✅ CORS protection for API endpoints
- ✅ Environment variable protection for sensitive data

---

## 📞 **Support & Documentation**

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

## 🏆 **What Makes This Special**

1. **🎯 Complete Solution**: Not just a framework - a complete, working auto repair system
2. **📊 Professional Data**: Real AutoZone pricing, comprehensive vehicle database
3. **🚀 Truly Portable**: One installer handles everything from Node.js to final setup
4. **🏭 Industry Ready**: Built for real auto repair shops with realistic data
5. **🔄 Modern Stack**: Latest technologies with professional development practices
6. **📧 Business Automation**: Automatic customer communications and workflow

---

**💼 Ready to streamline your auto repair business? Get started with the portable installer!**

**© 2025 PalmExitGarage - Professional Auto Repair Shop Management System**
