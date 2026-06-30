-- Turso / libSQL schema for Yeji Verse
-- Run with: turso db shell <db-name> < db/schema.sql

CREATE TABLE IF NOT EXISTS videos (
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
);

CREATE TABLE IF NOT EXISTS video_sources (
  id TEXT PRIMARY KEY,
  video_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  view_count INTEGER,
  view_count_updated_at TEXT,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_year ON videos(year);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_video_sources_video_id ON video_sources(video_id);
