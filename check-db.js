import Database from 'better-sqlite3';
const db = new Database('./data/database.db');

console.log('\n=== قاعدة البيانات ===\n');

// Count inspections
const inspections = db.prepare('SELECT COUNT(*) as count FROM inspections').get();
console.log(`✅ عدد الفحوصات: ${inspections.count}`);

// Count items
const items = db.prepare('SELECT COUNT(*) as count FROM inspection_items').get();
console.log(`✅ عدد الأعطال: ${items.count}`);

// Count photos
const photos = db.prepare('SELECT COUNT(*) as count FROM inspection_photos').get();
console.log(`📸 عدد الصور: ${photos.count}`);

// Get sample photos
const samplePhotos = db.prepare('SELECT * FROM inspection_photos LIMIT 5').all();
console.log('\n=== عينة من الصور ===');
console.log(samplePhotos);

// Get inspections with items and photos
const fullData = db.prepare(`
  SELECT 
    i.id as inspection_id,
    i.clientName,
    COUNT(DISTINCT it.id) as items_count,
    COUNT(p.id) as photos_count
  FROM inspections i
  LEFT JOIN inspection_items it ON i.id = it.inspectionId
  LEFT JOIN inspection_photos p ON it.id = p.itemId
  GROUP BY i.id
`).all();

console.log('\n=== الفحوصات مع البيانات ===');
console.table(fullData);

db.close();
