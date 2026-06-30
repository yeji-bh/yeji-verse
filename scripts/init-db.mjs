import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in environment.");
  process.exit(1);
}

const client = createClient({ url, authToken });

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), "../db/schema.sql");
const raw = readFileSync(schemaPath, "utf8");

const statements = [
  `CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  year INTEGER NOT NULL,
  thumbnail TEXT,
  site_views INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  `CREATE TABLE IF NOT EXISTS video_sources (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  view_count INTEGER,
  view_count_updated_at TEXT,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
)`,
  ...raw
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("CREATE INDEX")),
];

for (const sql of statements) {
  await client.execute(sql);
  console.log("✓", sql.split("\n")[0]);
}

const { rows } = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
);
console.log("\nTables:", rows.map((r) => r.name).join(", "));
