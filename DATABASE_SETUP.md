# Database Setup and Configuration

## Overview
This document explains the standardized database setup for PalmExitGarage to prevent configuration conflicts and data loss.

## Database Configuration

### Current Standardized Setup
- **Database Name**: `car_repair`
- **Docker Container**: `palmexitgarage-db`
- **Host Port**: `3308`
- **Container Port**: `3306`
- **Volume**: `car-repair-app_db_data`
- **Root Password**: `example`

### Configuration Files
All database settings are centralized in `/server/config/database.js`. This ensures consistency across:
- Main application server (`index.js`)
- Migration scripts (`migrate.js`)
- Any future database tools

## Starting the Database

### Using Docker Compose (Recommended)
```bash
cd C:\PalmExitGarage
docker-compose up -d
```

### Manual Docker Command (If needed)
```bash
docker run --name palmexitgarage-db \
  -e MYSQL_ROOT_PASSWORD=example \
  -e MYSQL_DATABASE=car_repair \
  -v car-repair-app_db_data:/var/lib/mysql \
  -p 3308:3306 \
  -d mysql:8.0
```

## Application Services

### Backend Server
- **Port**: `5000`
- **Start Command**: `node index.js`
- **Database Connection**: Uses `/server/config/database.js`

### Frontend Server
- **Port**: `5174`
- **Start Command**: `npm run dev`
- **API Endpoint**: `http://localhost:5000/api`

## Data Backup and Recovery

### Your Data Location
- **Docker Volume**: `car-repair-app_db_data`
- **Database**: `car_repair`
- **Tables**: customers, vehicles, parts, labor, work_orders, etc.

### Backup Command
```bash
docker exec palmexitgarage-db mysqldump -u root -pexample car_repair > backup.sql
```

### Restore Command
```bash
docker exec -i palmexitgarage-db mysql -u root -pexample car_repair < backup.sql
```

## Troubleshooting

### If Data Appears Missing
1. **Check Docker container**: `docker ps`
2. **Verify volume**: `docker volume ls` (should see `car-repair-app_db_data`)
3. **Check database connection**: Look for connection errors in server logs
4. **Verify database name**: Ensure all scripts use `car_repair`

### Common Issues Prevention
- ✅ All database connections use `/server/config/database.js`
- ✅ Docker Compose uses external volume `car-repair-app_db_data`
- ✅ Consistent port mapping (3308:3306)
- ✅ Single source of truth for database settings

## Migration and Schema Updates
Run migrations using:
```bash
cd C:\PalmExitGarage\server
node migrate.js
```

The migration script will:
- Connect to the correct database using centralized config
- Create any missing tables
- Preserve existing data

## Important Notes
⚠️ **NEVER** delete the `car-repair-app_db_data` Docker volume - it contains all your data
⚠️ **ALWAYS** use the centralized config file for database connections
⚠️ **VERIFY** the database name is `car_repair` in all configurations

## Quick Start Checklist
1. [ ] Start database: `docker-compose up -d`
2. [ ] Verify container: `docker ps` (should see `palmexitgarage-db`)
3. [ ] Start backend: `cd server && node index.js`
4. [ ] Start frontend: `cd frontend && npm run dev`
5. [ ] Test API: Visit `http://localhost:5000/api/customers`
6. [ ] Access app: Visit `http://localhost:5174`