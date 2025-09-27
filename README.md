# PalmExitGarage - Professional Auto Repair Management System

A comprehensive full-stack web application for managing auto repair shop operations including customer management, vehicle tracking, work orders, estimates, and automated email notifications.

## 🚀 Features

### Customer Management
- Add and manage customer profiles with contact information
- Search existing customers by name, phone, or email
- View complete customer service history
- Update customer information

### Vehicle Management  
- Add vehicles to customer profiles
- Comprehensive vehicle database with make/model/year lookup
- Track vehicle details (VIN, license plate, mileage, engine specs)
- Vehicle service history tracking

### Work Orders & Estimates
- Create detailed work orders with parts and labor
- **Status Management**: `Estimate` → `Approved` → `Started` → `Complete` → `Cancelled`
- Automatic tax calculations
- Digital signature capture for customer approval
- Print/email work order receipts

### Inventory Management
- Parts inventory with real-time stock tracking
- Labor services database with time estimates
- Search and filter parts/services
- Cost management and pricing

### Email Automation
- **Automatic pickup notification emails** when work is complete
- Professional HTML email templates
- Receipt generation and email delivery
- Gmail SMTP integration
- Email service configuration and testing

### Advanced Features
- Real-time work order status updates
- Customer signature capture (drawn or typed)
- Professional receipt generation
- Work order search and filtering
- Responsive design for desktop and mobile

## 🏗️ Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MySQL** database for data persistence
- **Nodemailer** for email services
- RESTful API architecture

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **Vite** for fast development and builds
- Responsive CSS styling

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL server
- Git

### Quick Start

#### Automated Setup (Recommended)
Run the startup script to start all services:
```powershell
.\start.ps1
```

#### Manual Setup
1. **Start Database**: `docker-compose up -d`
2. **Install Dependencies**: 
   - Backend: `cd server && npm install`
   - Frontend: `cd frontend && npm install`
3. **Start Services**:
   - Backend: `cd server && node index.js`
   - Frontend: `cd frontend && npm run dev`

### Services
- **Frontend**: http://localhost:5174 (or 5173)
- **Backend API**: http://localhost:5000
- **Database**: MySQL on port 3308

### System Health Check
Verify all services are running:
```powershell
.\verify.ps1
```

## 🔧 Configuration

### Database Configuration
- **Database Name**: `car_repair`
- **Docker Volume**: `car-repair-app_db_data` (contains your data)
- **Container Name**: `palmexitgarage-db`
- **Port**: 3308

⚠️ **Important**: Never delete the `car-repair-app_db_data` Docker volume - it contains all your customer and vehicle data.

### Email Service Setup
1. Navigate to **Email Settings** in the application
2. Configure Gmail SMTP settings:
   - **Email**: Your Gmail address
   - **Password**: Gmail App Password (not your regular password)
   - **Shop Name**: Your business name

### Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this password in the email configuration

## 📋 Usage Guide

### Creating Work Orders
1. **Add Customer**: Use "New Customer" or search "Existing Customer"
2. **Add Vehicle**: Add vehicle details to customer profile
3. **Create Estimate**: Go to "Estimate" to build work order with parts/labor
4. **Manage Status**: Update work order status as work progresses
5. **Complete Work**: Set status to "Complete" to automatically email customer

### Work Order Status Flow
- **Estimate**: Initial quote created
- **Approved**: Customer approved the work  
- **Started**: Work is in progress
- **Complete**: Work finished, customer notified automatically
- **Cancelled**: Work order cancelled

### Email Notifications
When a work order status changes to "Complete":
- Customer receives automatic pickup notification email
- Email includes work details, totals, and next steps
- Professional HTML template with shop branding

## 🗄️ Database Schema

### Key Tables
- `customers`: Customer information and contact details
- `vehicles`: Vehicle specifications and ownership
- `work_orders`: Work order details and status
- `work_order_parts`: Parts used in work orders
- `work_order_labor`: Labor services performed
- `parts`: Parts inventory
- `labor`: Labor services catalog

## 🔐 Security Features
- Input validation and sanitization
- SQL injection prevention
- Email validation
- Secure signature handling

For detailed setup and troubleshooting, see [DATABASE_SETUP.md](DATABASE_SETUP.md).
