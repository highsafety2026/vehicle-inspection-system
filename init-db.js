import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use absolute path for data directory
const dataDir = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/data'
  : join(__dirname, 'data');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory:', dataDir);
}

// Create database
const dbPath = join(dataDir, 'inspections.db');
console.log('📦 Database path:', dbPath);

const db = new Database(dbPath);

console.log('📦 Creating database tables...');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    vehicle_info TEXT NOT NULL,
    vin_number TEXT,
    color TEXT,
    mileage TEXT,
    engine_number TEXT,
    client_signature TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS inspection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_id INTEGER NOT NULL,
    part_name TEXT NOT NULL,
    defect_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    notes TEXT,
    position_x INTEGER,
    position_y INTEGER,
    vehicle_area TEXT,
    FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS inspection_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES inspection_items(id) ON DELETE CASCADE
  );
`);

db.close();

console.log('✅ Database initialized successfully at:', dbPath);
console.log('✅ Database initialized successfully at:', dbPath);
db.close();
