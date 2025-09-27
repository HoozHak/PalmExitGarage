# Vehicle Database Troubleshooting Guide

## Issue: Vehicle Make Dropdown Not Populated

If your vehicle dropdown menus are not populating, follow these steps:

### Step 1: Check if Database is Running
```bash
docker ps
```
You should see MySQL container running on port 3307.

If not running:
```bash
cd C:\PalmExitGarage
docker-compose up -d
```

### Step 2: Run Database Migrations
```bash
cd C:\PalmExitGarage\server
npm run migrate
```

### Step 3: Seed Vehicle Reference Data
```bash
npm run seed-vehicles
```

This should output:
```
Connected to MySQL database
Seeding vehicle reference table...
Query 1/5 completed
Query 2/5 completed
Query 3/5 completed
Query 4/5 completed
Query 5/5 completed
Vehicle reference table seeded successfully!
```

### Step 4: Start the API Server
```bash
npm run dev
```

This should output:
```
Server running on port 5000
Connected to MySQL database
```

### Step 5: Test the API Endpoints

Open a new terminal window and test:

```bash
# Test makes endpoint
curl http://localhost:5000/api/vehicle-reference/makes

# Should return JSON array like: ["Acura","Audi","BMW","Buick",...]
```

```bash
# Test models for a specific make
curl "http://localhost:5000/api/vehicle-reference/models/Honda"

# Should return JSON array like: ["Accord","CR-V","Civic","Fit",...]
```

### Step 6: Check Frontend is Running
```bash
cd C:\PalmExitGarage\frontend
npm run dev
```

Frontend should be accessible at: http://localhost:5173

## Common Issues and Solutions

### Issue: "Database connection failed"
**Solution:** Ensure MySQL Docker container is running on port 3307:
```bash
docker-compose up -d
```

### Issue: "Error reading vehicle SQL file"
**Solution:** Ensure your vehicle SQL file exists at:
```
C:\Users\HoozHak\Downloads\vehicles_seed_2011_2025_us.sql
```

### Issue: "Server won't start"
**Solution:** Check if port 5000 is available:
```bash
netstat -an | findstr :5000
```

### Issue: "Frontend can't connect to API"
**Solution:** Verify both services are running:
- API Server: http://localhost:5000
- Frontend: http://localhost:5173

Check browser console for CORS or network errors.

## Manual Database Check

You can manually check if the data was loaded by connecting to MySQL:

```bash
# Connect to database
docker exec -it palmexitgarage-db-1 mysql -u user -p car_repair

# Enter password: password

# Check if table exists and has data
SHOW TABLES;
SELECT COUNT(*) FROM vehicle_reference;
SELECT DISTINCT make FROM vehicle_reference LIMIT 10;
```

## API Endpoint Testing

Test each endpoint manually:

1. **Makes**: http://localhost:5000/api/vehicle-reference/makes
2. **Models**: http://localhost:5000/api/vehicle-reference/models/Honda
3. **Years**: http://localhost:5000/api/vehicle-reference/years/Honda/Accord

## Browser Developer Tools

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to use the vehicle dropdown
4. Look for failed API requests
5. Check Console tab for JavaScript errors

## Quick Fix Commands

Run these commands in sequence if dropdowns are empty:

```bash
# 1. Ensure database is running
cd C:\PalmExitGarage
docker-compose up -d

# 2. Run migrations
cd server
npm run migrate

# 3. Seed vehicle data
npm run seed-vehicles

# 4. Start server (in one terminal)
npm run dev

# 5. Start frontend (in another terminal)
cd ..\frontend
npm run dev
```

After running these commands, the vehicle dropdowns should populate correctly.

## Success Indicators

You'll know everything is working when:
- ✅ Docker shows MySQL container running
- ✅ Migration creates all tables successfully  
- ✅ Vehicle seeding completes with 5 queries
- ✅ Server starts and connects to database
- ✅ API endpoints return vehicle data
- ✅ Frontend dropdowns populate when checkbox is checked
- ✅ Make → Model → Year cascade works correctly