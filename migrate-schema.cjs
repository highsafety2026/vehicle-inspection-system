const Database = require('better-sqlite3');
const db = new Database('c:/Users/Dell/Videos/HS.AF/data/database.db');

console.log('Starting migration...');

// Begin transaction
db.exec('BEGIN TRANSACTION;');

try {
  // Create new table without license_plate column
  db.exec(`
    CREATE TABLE inspections_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      vehicle_info TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress',
      created_at INTEGER,
      client_phone TEXT,
      client_email TEXT,
      vin_number TEXT,
      color TEXT,
      mileage TEXT,
      engine_number TEXT,
      client_signature TEXT
    );
  `);

  // Copy data from old table to new (excluding license_plate)
  db.exec(`
    INSERT INTO inspections_new (
      id, client_name, vehicle_info, status, created_at,
      client_phone, client_email, vin_number, color, mileage,
      engine_number, client_signature
    )
    SELECT 
      id, client_name, vehicle_info, status, created_at,
      client_phone, client_email, vin_number, color, mileage,
      engine_number, client_signature
    FROM inspections;
  `);

  // Drop old table
  db.exec('DROP TABLE inspections;');

  // Rename new table
  db.exec('ALTER TABLE inspections_new RENAME TO inspections;');

  // Commit transaction
  db.exec('COMMIT;');

  console.log('✓ Migration completed successfully!');
  console.log('✓ Removed license_plate column');
  console.log('✓ Kept client_signature column');
} catch (error) {
  // Rollback on error
  db.exec('ROLLBACK;');
  console.error('✗ Migration failed:', error.message);
  process.exit(1);
}

db.close();
