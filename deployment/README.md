# PalmExitGarage - Professional Auto Repair Shop System

## Portable Installation Package

This is a complete, portable installation package for PalmExitGarage that can be installed on any Windows machine from a USB flash drive.

---

## Quick Start

### Option 1: One-Click Installation
1. **Right-click** on `INSTALL_PALMEXITGARAGE.bat`
2. Select **"Run as administrator"**
3. Follow the prompts - the installer will handle everything automatically!

### Option 2: Manual Installation Steps
If you encounter any issues with the automatic installer:
1. Install Node.js manually (download from nodejs.org)
2. Install Docker Desktop manually (download from docker.com)
3. Run `setup_database.bat` to set up the database
4. Use `START_PALMEXITGARAGE.bat` to start the application

---

## System Requirements

- **Operating System**: Windows 10 or Windows 11
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **Network**: Internet connection required for initial setup
- **Administrator Rights**: Required for installation

---

## What's Included

This installation package contains:

### Applications & Dependencies
- PalmExitGarage Frontend (React-based web interface)
- PalmExitGarage Backend (Node.js/Express server)
- MySQL Database (Running in Docker container)
- Automatic inventory management with intelligent deduction system
- Database Management System (Professional administration tools)
- Automatic installers for Node.js and Docker Desktop

### Database Content
- 6,057 Vehicle Models (2010-2025, all major manufacturers)
- 88 Professional Parts (AutoZone business pricing) with inventory tracking
- Sample Customer Data (4 customers, 4 vehicles)
- Labor Operations Catalog (10 common services)
- Honda Crosstour Models (2010-2015, all variants)
- Clean work order history (ready for production use)

---

## Installation Process

The installer will automatically:

1. **Check Prerequisites** - Verify Node.js and Docker are installed
2. **Download & Install** - Get Node.js and Docker Desktop if needed
3. **Install Dependencies** - Install all required Node.js packages
4. **Setup Database** - Create and populate the database with all data
5. **Create Shortcuts** - Add desktop and Start Menu shortcuts

**Estimated Installation Time**: 10-30 minutes (depending on internet speed)

---

## Using PalmExitGarage

### Starting the Application
- **Desktop**: Double-click "Start PalmExitGarage" shortcut
- **Start Menu**: Start → PalmExitGarage → Start PalmExitGarage
- **Manual**: Run `START_PALMEXITGARAGE.bat`

### Stopping the Application
- **Start Menu**: Start → PalmExitGarage → Stop PalmExitGarage  
- **Manual**: Run `STOP_PALMEXITGARAGE.bat`

### Accessing the Application
Once started, PalmExitGarage will be available at:
- **Web Interface**: http://localhost:5174
- **API Server**: http://localhost:5000

---

## Database Information

### Complete Vehicle Database
- **Years Covered**: 2010-2025
- **Total Vehicles**: 6,057 combinations
- **Major Brands**: Honda, Toyota, Ford, Chevrolet, Nissan, BMW, Mercedes-Benz, Audi, and 19+ more
- **Honda Crosstour**: All variants (2010-2015) including EX, EX-L, EX-L V6

### Professional Parts Catalog
- **Total Parts**: 88 professional automotive parts
- **Pricing**: Based on AutoZone business pricing schema
- **Categories**: Engine, Brakes, Suspension, Electrical, Fluids, Filters, Tools, and more
- **Brands**: ACDelco, Bosch, Wagner, Monroe, Mobil 1, Interstate, and other quality brands

### Sample Data
- **4 Sample Customers** with complete contact information
- **4 Sample Vehicles** associated with customers
- **10 Labor Operations** with realistic pricing and time estimates
- **Clean Work Orders**: No existing work orders - ready for fresh start
- **Inventory Management**: All parts properly tracked with quantity on hand

---

## Troubleshooting

### Common Issues

**"Docker is not running"**
- Make sure Docker Desktop is installed and running
- Look for Docker Desktop icon in system tray
- If not installed, run the installer as administrator

**"Node.js command not found"**
- Node.js may not be in PATH
- Restart command prompt/PowerShell after Node.js installation
- Run installer as administrator

**"Database connection failed"**
- Wait for Docker Desktop to fully start (can take 1-2 minutes)
- Check if port 3308 is available
- Restart Docker Desktop if needed

**"Port already in use"**
- Default ports: 5174 (frontend), 5000 (backend), 3308 (database)
- Stop other applications using these ports
- Or modify ports in configuration files

### Getting Help

1. **Check Docker Desktop**: Make sure it's running and healthy
2. **Check Windows Services**: Ensure Docker services are started
3. **Restart Services**: Try stopping and starting PalmExitGarage
4. **Reinstall**: Run the installer again if components are corrupted

---

## File Structure

```
PalmExitGarage/
├── deployment/                 # Installation files
│   ├── INSTALL_PALMEXITGARAGE.bat    # Main installer
│   ├── START_PALMEXITGARAGE.bat      # Start application
│   ├── STOP_PALMEXITGARAGE.bat       # Stop application
│   ├── database_backup/              # Database backup
│   └── installers/                   # Downloaded installers
├── server/                     # Backend application
├── frontend/                   # Frontend application
├── docker-compose.yml          # Docker configuration
└── README.md                   # This file
```

---

## Production Deployment

This package is designed for:
- Small to medium auto repair shops
- Single-location businesses
- Local network deployment
- Development and testing environments

For multi-location or cloud deployment, additional configuration may be required.

---

## Support

For technical support or questions about PalmExitGarage:
- Check the troubleshooting section above
- Review log files in the server and frontend directories
- Ensure all system requirements are met

---

## Security Notes

- Default database credentials are included (development use)
- Change default passwords for production use
- Configure firewall rules as needed
- Keep Docker Desktop and Node.js updated

---

© 2025 PalmExitGarage - Professional Auto Repair Shop Management System
