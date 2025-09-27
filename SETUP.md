# Palm Exit Garage Management System - Setup Instructions

## Overview

This is a comprehensive garage management system that includes:
- ✅ Customer management with auto-generated Customer IDs
- ✅ Vehicle registration with make/model/year from 2011-2025 US database
- ✅ Parts inventory with auto-generated Part IDs
- ✅ Real-time search/filter functionality for customers, vehicles, and parts
- ✅ Customer repair history tracking
- ✅ Edit capabilities for customers and vehicles

## Prerequisites

- Node.js (v16 or higher)
- MySQL 8.0
- Docker (optional, for easier MySQL setup)

## Database Setup

### Option 1: Using Docker (Recommended)

1. Start the MySQL database:
```bash
cd C:\PalmExitGarage
docker-compose up -d
```

This will create a MySQL database on port 3307 with:
- Database: `car_repair`
- Username: `user`
- Password: `password`
- Root password: `example`

### Option 2: Local MySQL Installation

If you have MySQL installed locally:
1. Create a database called `car_repair`
2. Update the connection settings in `server/index.js` and `server/migrate.js`

## Server Setup

1. Navigate to the server directory:
```bash
cd C:\PalmExitGarage\server
```

2. Install dependencies:
```bash
npm install
```

3. Run database migrations to create tables:
```bash
npm run migrate
```

4. Seed the vehicle reference database:
```bash
npm run seed-vehicles
```

This will populate the `vehicle_reference` table with US vehicle makes, models, and years from 2011-2025 from your provided SQL file.

5. Start the server:
```bash
npm run dev
```

The API server will be running on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd C:\PalmExitGarage\frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## Features

### Navigation System
- **Persistent Navigation**: Every page (except Home) includes a sticky navigation header
- **Logo Navigation**: Click the logo to return to home from any page
- **Active Page Highlighting**: Current page is highlighted in the navigation tabs
- **Quick Access**: Access any major section from any page - never get "stuck"
- **Professional Design**: Matches Palm Exit Garage theme with black/gold styling

### Customer Management
- **Add New Customer**: Navigate to "New Customer" from the home page
- **Required Fields**: First Name, Last Name, Phone Number
- **Optional Fields**: Email, Address, City, State, ZIP Code
- **Auto-generated Customer ID**: Automatically assigned and displayed upon creation
- **Integrated Vehicle Registration**: Option to add a vehicle directly when creating a new customer
  - Checkbox toggle to enable vehicle registration in same form
  - Cascading dropdown menus (Make → Model → Year) from vehicle reference database
  - Complete vehicle details: VIN, License Plate, Color, Mileage, Engine Size, Transmission, Notes
  - Vehicle ID automatically generated when vehicle is added

### Existing Customer Management
- **Search Functionality**: Search by name, phone, email, or Customer ID
- **Real-time Filtering**: Results appear as you type (minimum 2 characters)
- **Customer Details**: View complete customer information
- **Edit Customer**: Click "Edit Customer" to modify customer details
- **Repair History**: View all past work orders with status and costs

### Vehicle Management
- **Add New Vehicle**: Available from existing customer page or direct navigation
- **Customer Assignment**: Search and select customer with auto-complete dropdown
- **Make/Model/Year**: Cascading dropdowns populated from vehicle reference database
  - Select Make → Models populate automatically
  - Select Model → Years populate automatically
- **Additional Fields**: VIN, License Plate, Color, Mileage, Engine Size, Transmission, Notes
- **Auto-generated Vehicle ID**: Automatically assigned upon creation

### Parts Management
- **Add New Parts**: Click "Add New Part" button in Parts Inventory
- **Required Fields**: Brand, Part Name, Cost
- **Optional Fields**: Part Number, Category, Description, In Stock status
- **Auto-generated Part ID**: Automatically assigned upon creation
- **Search Functionality**: Real-time search by brand, name, part number, or category
- **Inventory Tracking**: In Stock/Out of Stock status display

### Search and Filter Features
- **Customer Search**: Name, phone, email, Customer ID
- **Vehicle Search**: Make, model combinations from database
- **Parts Search**: Brand, item name, part number, category
- **Real-time Results**: All searches update as you type
- **Minimum Characters**: Most searches require 2+ characters for performance

## Database Schema

### Core Tables
- `customers`: Customer information with auto-increment customer_id
- `vehicle_reference`: US vehicles 2011-2025 (make, model, year)
- `vehicles`: Customer vehicles linked to vehicle_reference data
- `parts`: Parts inventory with auto-increment part_id
- `work_orders`: Repair estimates and work orders
- `work_order_parts` & `work_order_labor`: Junction tables for work order details

### Key Features
- **Foreign Key Relationships**: Proper data integrity
- **Auto-increment IDs**: All primary entities have auto-generated IDs
- **Timestamp Tracking**: Created/updated timestamps on all records
- **Flexible Schema**: Supports future expansion

## API Endpoints

### Customer Endpoints
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Add new customer
- `PUT /api/customers/:id` - Update customer
- `GET /api/customers/:id/history` - Get customer with vehicles and repair history
- `GET /api/customers/search?query=term` - Search customers

### Vehicle Endpoints
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `GET /api/customers/:customerId/vehicles` - Get customer vehicles

### Vehicle Reference Endpoints
- `GET /api/vehicle-reference/makes` - Get all makes
- `GET /api/vehicle-reference/models/:make` - Get models for a make
- `GET /api/vehicle-reference/years/:make/:model` - Get years for make/model
- `GET /api/vehicle-reference/search?query=term` - Search vehicle reference

### Parts Endpoints
- `GET /api/parts` - List all parts
- `POST /api/parts` - Add new part
- `GET /api/parts/search?query=term` - Search parts

## Troubleshooting

### Database Connection Issues
1. Ensure Docker is running and MySQL container is up
2. Check port 3307 is not in use by another service
3. Verify connection settings in server files

### Server Won't Start
1. Ensure Node.js dependencies are installed: `npm install`
2. Check if port 5000 is available
3. Run migrations: `npm run migrate`

### Vehicle Reference Data Missing
1. Ensure the vehicle seed file exists at: `C:\Users\HoozHak\Downloads\vehicles_seed_2011_2025_us.sql`
2. Run: `npm run seed-vehicles`
3. Check server console for any SQL errors

### Frontend Issues
1. Ensure server is running on port 5000
2. Check browser console for API errors
3. Verify React dependencies: `npm install`

## Development Notes

### Code Structure
- **Backend**: Node.js + Express + MySQL2
- **Frontend**: React 19 + Vite
- **Styling**: Inline styles with Palm Exit Garage theme (black/gold)
- **State Management**: React hooks (useState, useEffect)
- **Routing**: React Router DOM

### Key Components
- `Navigation.jsx`: Shared navigation header with logo and tabs
- `AddCustomer.jsx`: New customer form with validation
- `AddVehicle.jsx`: Vehicle registration with customer lookup
- `ExistingCustomer.jsx`: Customer search, details, and editing
- `PartsManager.jsx`: Parts inventory management
- `Estimate.jsx`: Enhanced estimate page with navigation

### API Design
- RESTful endpoints
- JSON request/response format
- Error handling with appropriate HTTP status codes
- Search endpoints with query parameters

## Future Enhancements

Potential additions:
- Work order/estimate creation interface
- PDF report generation
- Email notifications
- Inventory alerts for low stock
- Customer communication history
- Photo uploads for vehicles/parts
- Barcode scanning for parts

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server and browser console logs
3. Ensure all dependencies are properly installed
4. Verify database connection and table creation