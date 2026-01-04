import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create data directory
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Create database
const dbPath = join(dataDir, 'inspections.db');
const db = new Database(dbPath);

console.log('📦 Creating database tables...');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientName TEXT NOT NULL,
    clientPhone TEXT NOT NULL,
    clientEmail TEXT NOT NULL,
    vehicleInfo TEXT NOT NULL,
    vinNumber TEXT,
    color TEXT NOT NULL,
    mileage TEXT NOT NULL,
    engineNumber TEXT,
    clientSignature TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inspection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspectionId INTEGER NOT NULL,
    partName TEXT NOT NULL,
    defectType TEXT NOT NULL,
    severity TEXT NOT NULL,
    notes TEXT,
    positionX INTEGER,
    positionY INTEGER,
    vehicleArea TEXT,
    FOREIGN KEY (inspectionId) REFERENCES inspections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS inspection_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemId INTEGER NOT NULL,
    photoPath TEXT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itemId) REFERENCES inspection_items(id) ON DELETE CASCADE
  );
`);

console.log('✅ Database initialized successfully!');
db.close();
