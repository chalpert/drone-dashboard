# Drone Build Tracker Database Documentation

## Overview

This project uses **Prisma ORM** with **SQLite** as the database engine to manage drone build data. The database stores information about drones, their component categories, individual components, build progress, and activities. All data in the application flows from this centralized database, ensuring consistency across the Fleet page, Admin panel, and any future features.

## Table of Contents

1. [Database Structure](#database-structure)
2. [Getting Started](#getting-started)
3. [Configuration](#configuration)
4. [Database Management](#database-management)
5. [Editing Data](#editing-data)
6. [Development Workflow](#development-workflow)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Operations](#advanced-operations)

---

## Database Structure

### Schema Overview

The database consists of 5 main tables that work together to track drone builds:

```
CategoryDefinition (Templates)
├── ComponentDefinition (Templates)
    
Drone (Individual Units)
├── DroneCategory (Instance per category per drone)
    ├── DroneComponent (Instance per component per drone)
├── BuildActivity (History log)
```

### Table Details

#### 1. **CategoryDefinition** (`category_definitions`)
Defines the main component categories (templates used for all drones).
- `name`: Category name (e.g., "Airframe", "Propulsion")
- `weight`: Percentage contribution to overall drone completion (0-100)

#### 2. **ComponentDefinition** (`component_definitions`)
Defines individual components within categories (templates used for all drones).
- `name`: Component name (e.g., "Composite", "Lifters")
- `categoryId`: Links to CategoryDefinition
- `weight`: Percentage within its category (0-100)

#### 3. **Drone** (`drones`)
Individual drone units being tracked.
- `serial`: Unique identifier (e.g., "S1", "S2")
- `model`: Drone model ("G1-M" or "G1-C")
- `status`: Overall status ("pending", "in-progress", "completed")
- `overallCompletion`: Calculated percentage (0-100)
- `startDate`: When build started
- `estimatedCompletion`: Target completion date

#### 4. **DroneCategory** (`drone_categories`)
Tracks category-level progress for each drone.
- `droneId`: Links to Drone
- `categoryDefinitionId`: Links to CategoryDefinition
- `completionPercentage`: Calculated progress for this category (0-100)

#### 5. **DroneComponent** (`drone_components`)
Tracks individual component status for each drone.
- `droneCategoryId`: Links to DroneCategory
- `componentDefinitionId`: Links to ComponentDefinition
- `status`: Component status ("pending", "in-progress", "completed")

#### 6. **BuildActivity** (`build_activities`)
Historical log of build activities.
- `droneId`: Links to Drone
- `componentName`: Name of affected component
- `action`: Type of action ("started", "completed", "updated")
- `status`: Status after action
- `timestamp`: When action occurred

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Project dependencies installed (`npm install`)

### Initial Setup

1. **Environment Configuration**
   ```bash
   # Ensure .env file exists with:
   DATABASE_URL="file:./dev.db"
   ```

2. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Initialize Database**
   ```bash
   npx prisma db push
   ```

4. **Seed with Sample Data**
   ```bash
   npx prisma db seed
   ```

### Verification
```bash
# Check if everything is working
npm run dev
# Visit http://localhost:3000 to see the application with data
```

---

## Configuration

### Environment Variables

**`.env` file:**
```bash
DATABASE_URL="file:./dev.db"
```

**Important Notes:**
- The database file will be created at `prisma/dev.db`
- This file contains all your data - **backup regularly**
- SQLite is serverless, so no additional database server needed

### Prisma Configuration

**`prisma/schema.prisma`:**
- Defines the database structure
- Uses SQLite as the provider
- Contains all model definitions and relationships
- Automatically generates TypeScript types

---

## Database Management

### Prisma Studio (Recommended GUI)

**Launch Prisma Studio:**
```bash
npx prisma studio
```

This opens a web-based GUI at `http://localhost:5555` where you can:
- ✅ View all data in tables
- ✅ Edit records directly
- ✅ Add new records
- ✅ Delete records
- ✅ See relationships between tables

**Prisma Studio Tips:**
- **Safe Editing**: Changes are saved immediately
- **Relationship Navigation**: Click related fields to jump between tables
- **Bulk Operations**: Use filters to find and edit multiple records
- **Data Validation**: Prisma enforces schema constraints automatically

### Command Line Operations

**Reset Database (⚠️ Destructive):**
```bash
npx prisma db push --force-reset
npx prisma db seed
```

**Re-seed Database:**
```bash
npx prisma db seed
```

**Generate Types After Schema Changes:**
```bash
npx prisma generate
```

**View Database Schema:**
```bash
npx prisma db pull
```

### Direct SQLite Access

**Using SQLite CLI:**
```bash
# Install sqlite3 if not installed
brew install sqlite3  # macOS
# sudo apt-get install sqlite3  # Linux

# Access database directly
sqlite3 prisma/dev.db

# Common SQLite commands:
.tables                    # List all tables
.schema drones            # Show table structure
SELECT * FROM drones;     # Query data
.quit                     # Exit
```

---

## Editing Data

### Adding New Drones

**Method 1: Prisma Studio (Recommended)**
1. Run `npx prisma studio`
2. Go to "Drone" table
3. Click "Add record"
4. Fill required fields:
   - `serial`: Unique (e.g., "S4", "S5")
   - `model`: "G1-M" or "G1-C"
   - `status`: "pending", "in-progress", or "completed"
5. Save - categories and components will be auto-created

**Method 2: Direct SQL**
```sql
INSERT INTO drones (id, serial, model, status, overallCompletion, createdAt, updatedAt) 
VALUES ('new-drone-id', 'S4', 'G1-M', 'pending', 0, datetime('now'), datetime('now'));
```

### Updating Component Status

**Method 1: Prisma Studio**
1. Go to "DroneComponent" table
2. Filter by drone (use relationships)
3. Update `status` field for specific components
4. Percentages will auto-calculate on next page load

**Method 2: SQL Query**
```sql
-- Update specific component status
UPDATE drone_components 
SET status = 'completed' 
WHERE id = 'component-id';

-- Update multiple components for a drone
UPDATE drone_components 
SET status = 'in-progress' 
WHERE droneCategoryId IN (
    SELECT id FROM drone_categories WHERE droneId = 'drone-id'
);
```

### Bulk Operations

**Example: Mark all Airframe components completed for drone S1**
```sql
UPDATE drone_components 
SET status = 'completed'
WHERE droneCategoryId IN (
    SELECT dc.id 
    FROM drone_categories dc
    JOIN category_definitions cd ON dc.categoryDefinitionId = cd.id
    JOIN drones d ON dc.droneId = d.id
    WHERE d.serial = 'S1' AND cd.name = 'Airframe'
);
```

---

## Development Workflow

### Making Schema Changes

1. **Edit `prisma/schema.prisma`**
2. **Push changes to database:**
   ```bash
   npx prisma db push
   ```
3. **Regenerate client:**
   ```bash
   npx prisma generate
   ```
4. **Update seed data if needed:**
   ```bash
   npx prisma db seed
   ```

### Testing Changes

**Safe Testing Environment:**
```bash
# Backup current database
cp prisma/dev.db prisma/dev.db.backup

# Make changes and test

# If issues, restore backup:
cp prisma/dev.db.backup prisma/dev.db
```

### Data Migration

**When adding new component categories:**
1. Update `lib/types.ts` with new definitions
2. Run seed script to add new categories
3. Existing drones will automatically get new categories

---

## Best Practices

### ✅ DO's

1. **Always backup before major changes:**
   ```bash
   cp prisma/dev.db prisma/dev.db.backup
   ```

2. **Use Prisma Studio for complex editing** - it prevents relationship errors

3. **Test changes in development** before production

4. **Keep seed script updated** with realistic data

5. **Use transactions for related operations:**
   ```typescript
   await prisma.$transaction([
     prisma.droneComponent.update({...}),
     prisma.droneCategory.update({...})
   ])
   ```

6. **Validate data integrity regularly:**
   ```bash
   npx prisma validate
   ```

### ❌ DON'Ts

1. **Don't edit the database file directly** with external tools while the app is running

2. **Don't delete CategoryDefinition or ComponentDefinition records** - this breaks existing drones

3. **Don't manually calculate percentages** - let the application handle calculations

4. **Don't forget to backup** before running reset commands

5. **Don't use reserved SQL keywords** as field names

### Performance Tips

- **SQLite is fast for this use case** (hundreds of drones)
- **Indexes are automatically created** for primary keys and unique fields
- **Use LIMIT in queries** when browsing large datasets
- **Connection pooling not needed** with SQLite

---

## Troubleshooting

### Common Issues

**1. Database locked error**
```bash
# Solution: Close all connections
pkill -f "prisma studio"
# Or restart the app
```

**2. Schema out of sync**
```bash
npx prisma db push
npx prisma generate
```

**3. Corrupt database**
```bash
# Check integrity
sqlite3 prisma/dev.db "PRAGMA integrity_check;"

# If corrupt, restore from backup
cp prisma/dev.db.backup prisma/dev.db
```

**4. Missing data after seed**
```bash
# Check if seed script ran successfully
npx prisma db seed --verbose
```

**5. Percentage calculations wrong**
- Check component weights sum to 100% per category
- Check category weights sum to 100% total
- Restart app to trigger recalculation

### Diagnostic Commands

```bash
# Check database file exists and size
ls -la prisma/dev.db

# Validate schema
npx prisma validate

# Check connection
npx prisma db execute --command "SELECT COUNT(*) FROM drones;"

# Show all tables and row counts
sqlite3 prisma/dev.db ".tables" && sqlite3 prisma/dev.db "SELECT 'drones: ' || COUNT(*) FROM drones;"
```

---

## Advanced Operations

### Custom Queries

**Find drones with specific completion range:**
```sql
SELECT serial, model, overallCompletion 
FROM drones 
WHERE overallCompletion BETWEEN 20 AND 80;
```

**Get detailed component status for a drone:**
```sql
SELECT 
    d.serial,
    cd.name as category,
    comp.name as component,
    dc.status,
    comp.weight
FROM drones d
JOIN drone_categories cat ON d.id = cat.droneId
JOIN category_definitions cd ON cat.categoryDefinitionId = cd.id
JOIN drone_components dc ON cat.id = dc.droneCategoryId
JOIN component_definitions comp ON dc.componentDefinitionId = comp.id
WHERE d.serial = 'S1'
ORDER BY cd.name, comp.name;
```

### Backup and Restore

**Automated Backup Script:**
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
cp prisma/dev.db "backups/dev.db.$DATE"
echo "Database backed up to backups/dev.db.$DATE"
```

**Export Data:**
```bash
sqlite3 prisma/dev.db ".dump" > database_export.sql
```

**Import Data:**
```bash
sqlite3 new_database.db < database_export.sql
```

### Performance Monitoring

**Query Performance:**
```sql
-- Enable query timer in sqlite3
.timer on
SELECT COUNT(*) FROM drones;
```

**Database Size:**
```bash
du -h prisma/dev.db
```

---

## Quick Reference

### Essential Commands
```bash
# Start GUI editor
npx prisma studio

# Reset everything
npx prisma db push --force-reset && npx prisma db seed

# Backup database
cp prisma/dev.db prisma/dev.db.backup

# Check application
npm run dev
```

### File Locations
- **Database File**: `prisma/dev.db`
- **Schema**: `prisma/schema.prisma`
- **Seed Script**: `prisma/seed.ts`
- **Environment**: `.env`

### Status Values
- **Drone Status**: `"pending"`, `"in-progress"`, `"completed"`
- **Component Status**: `"pending"`, `"in-progress"`, `"completed"`
- **Drone Models**: `"G1-M"`, `"G1-C"`

---

## Getting Help

1. **Check the error message** first - Prisma errors are usually descriptive
2. **Use Prisma Studio** for visual debugging
3. **Check the application logs** when running `npm run dev`
4. **Verify schema** with `npx prisma validate`
5. **Restore from backup** if data is corrupted

Remember: The database is the single source of truth for all application data. Handle with care, backup regularly, and test changes in development first.
