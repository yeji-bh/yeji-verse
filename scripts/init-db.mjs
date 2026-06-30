import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`,
  `CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  year INTEGER NOT NULL,
  thumbnail TEXT,
  site_views INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'approved',
  submitted_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL
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
  `CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  video_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, video_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
)`,
  `CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  nickname TEXT,
  content TEXT NOT NULL,
  user_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)`,
  "CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category)",
  "CREATE INDEX IF NOT EXISTS idx_videos_year ON videos(year)",
  "CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)",
  "CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at)",
  "CREATE INDEX IF NOT EXISTS idx_video_sources_video_id ON video_sources(video_id)",
  "CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id)",
  "CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)",
];

for (const sql of statements) {
  try {
    await client.execute(sql);
    console.log("✓", sql.split("\n")[0].slice(0, 70));
  } catch (e) {
    console.error("✗", e.message);
  }
}

const migrations = [
  "ALTER TABLE users RENAME COLUMN email TO username",
  "ALTER TABLE videos ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'",
  "ALTER TABLE videos ADD COLUMN submitted_by TEXT",
  "ALTER TABLE videos ADD COLUMN published_date TEXT",
];

for (const sql of migrations) {
  try {
    await client.execute(sql);
    console.log("✓ migration:", sql.slice(0, 50));
  } catch {
    /* already exists */
  }
}

const { rows } = await client.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
);
console.log("\nTables:", rows.map((r) => r.name).join(", "));
