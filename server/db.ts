import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

// Use absolute path in production, relative in development
const dataDir = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/data'
  : path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "inspections.db");
console.log("📦 Database path:", dbPath);

const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
