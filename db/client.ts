import { createClient, type Client } from "@libsql/client";
import type {
  Comment,
  SubmitVideoPayload,
  User,
  UserRole,
  Video,
  VideoSource,
  VideoStatus,
} from "@/lib/types";
import { dedupeTags } from "@/lib/tags";

let client: Client | null = null;
let starterPicksTableReady = false;

function getClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  if (!client) client = createClient({ url, authToken });
  return client;
}

function rowToVideo(row: Record<string, unknown>, sources: VideoSource[]): Video {
  const year = row.year as number;
  const createdAt = row.created_at as string;
  const rawPublished = row.published_date as string | null | undefined;
  const publishedDate =
    (rawPublished && rawPublished.trim()) ||
    (createdAt ? createdAt.slice(0, 10) : "") ||
    `${year}-01-01`;
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    category: row.category as Video["category"],
    tags: dedupeTags(JSON.parse((row.tags as string) || "[]")),
    publishedDate,
    year: Number(publishedDate.slice(0, 4)) || year,
    thumbnail: (row.thumbnail as string) ?? "",
    siteViews: (row.site_views as number) ?? 0,
    status: ((row.status as string) ?? "approved") as VideoStatus,
    submittedBy: (row.submitted_by as string | null) ?? null,
    createdAt: row.created_at as string,
    sources,
  };
}

async function loadSources(db: Client, videoId: string): Promise<VideoSource[]> {
  const { rows } = await db.execute({
    sql: "SELECT * FROM video_sources WHERE video_id = ?",
    args: [videoId],
  });
  return rows.map((s) => ({
    id: s.id as string,
    platform: s.platform as string,
    url: s.url as string,
    viewCount: (s.view_count as number | null) ?? null,
    viewCountUpdatedAt: (s.view_count_updated_at as string | null) ?? null,
  }));
}

async function loadSourcesForVideos(
  db: Client,
  videoIds: string[],
): Promise<Map<string, VideoSource[]>> {
  const map = new Map<string, VideoSource[]>();
  if (videoIds.length === 0) return map;

  const placeholders = videoIds.map(() => "?").join(", ");
  const { rows } = await db.execute({
    sql: `SELECT * FROM video_sources WHERE video_id IN (${placeholders})`,
    args: videoIds,
  });

  for (const s of rows) {
    const videoId = s.video_id as string;
    const list = map.get(videoId) ?? [];
    list.push({
      id: s.id as string,
      platform: s.platform as string,
      url: s.url as string,
      viewCount: (s.view_count as number | null) ?? null,
      viewCountUpdatedAt: (s.view_count_updated_at as string | null) ?? null,
    });
    map.set(videoId, list);
  }

  return map;
}

async function rowsToVideos(db: Client, rows: Record<string, unknown>[]): Promise<Video[]> {
  const sourceMap = await loadSourcesForVideos(
    db,
    rows.map((row) => row.id as string),
  );
  return rows.map((row) =>
    rowToVideo(row, sourceMap.get(row.id as string) ?? []),
  );
}

export async function getVideosPageFromDb(
  limit: number,
  offset: number,
  status: VideoStatus | "all" = "approved",
): Promise<{ videos: Video[]; total: number } | null> {
  const db = getClient();
  if (!db) return null;

  try {
    const countSql =
      status === "all"
        ? "SELECT COUNT(*) as c FROM videos"
        : "SELECT COUNT(*) as c FROM videos WHERE status = ?";

    const { rows: countRows } = await db.execute(
      status === "all" ? countSql : { sql: countSql, args: [status] },
    );
    const total = (countRows[0]?.c as number) ?? 0;

    const sql =
      status === "all"
        ? "SELECT * FROM videos ORDER BY created_at DESC LIMIT ? OFFSET ?"
        : "SELECT * FROM videos WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";

    const { rows } = await db.execute(
      status === "all"
        ? { sql, args: [limit, offset] }
        : { sql, args: [status, limit, offset] },
    );

    const videos = await rowsToVideos(db, rows as Record<string, unknown>[]);
    return { videos, total };
  } catch {
    return null;
  }
}

export async function getVideosFromDb(
  status: VideoStatus | "all" = "approved",
): Promise<Video[] | null> {
  const db = getClient();
  if (!db) return null;

  try {
    const sql =
      status === "all"
        ? "SELECT * FROM videos ORDER BY created_at DESC"
        : "SELECT * FROM videos WHERE status = ? ORDER BY created_at DESC";

    const { rows } = await db.execute(
      status === "all" ? sql : { sql, args: [status] },
    );

    return rowsToVideos(db, rows as Record<string, unknown>[]);
  } catch {
    return null;
  }
}

export async function getVideoById(id: string): Promise<Video | null> {
  const db = getClient();
  if (!db) return null;

  const { rows } = await db.execute({
    sql: "SELECT * FROM videos WHERE id = ?",
    args: [id],
  });
  if (rows.length === 0) return null;

  const sources = await loadSources(db, id);
  return rowToVideo(rows[0] as Record<string, unknown>, sources);
}

export async function insertVideoToDb(
  payload: SubmitVideoPayload & {
    id: string;
    thumbnail: string;
    status?: VideoStatus;
    submittedBy?: string | null;
    description?: string;
  },
): Promise<Video | null> {
  const db = getClient();
  if (!db) return null;

  const now = new Date().toISOString();
  const status = payload.status ?? "pending";
  const year = Number(payload.publishedDate.slice(0, 4));

  try {
    await db.execute({
      sql: `INSERT INTO videos (id, title, description, category, tags, year, published_date, thumbnail, status, submitted_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        payload.id,
        payload.title,
        payload.description ?? "",
        payload.category,
        JSON.stringify(dedupeTags(payload.tags)),
        year,
        payload.publishedDate,
        payload.thumbnail,
        status,
        payload.submittedBy ?? null,
        now,
        now,
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("published_date")) throw err;

    await db.execute({
      sql: `INSERT INTO videos (id, title, description, category, tags, year, thumbnail, status, submitted_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        payload.id,
        payload.title,
        payload.description ?? "",
        payload.category,
        JSON.stringify(dedupeTags(payload.tags)),
        year,
        payload.thumbnail,
        status,
        payload.submittedBy ?? null,
        now,
        now,
      ],
    });
  }

  const sources: VideoSource[] = [];
  for (const [i, source] of payload.sources.entries()) {
    const sourceId = `${payload.id}-src-${i}`;
    await db.execute({
      sql: "INSERT INTO video_sources (id, video_id, platform, url) VALUES (?, ?, ?, ?)",
      args: [sourceId, payload.id, source.platform, source.url],
    });
    sources.push({
      id: sourceId,
      platform: source.platform,
      url: source.url,
      viewCount: null,
      viewCountUpdatedAt: null,
    });
  }

  return rowToVideo(
    {
      id: payload.id,
      title: payload.title,
      description: payload.description ?? "",
      category: payload.category,
      tags: JSON.stringify(payload.tags),
      year,
      published_date: payload.publishedDate,
      thumbnail: payload.thumbnail,
      site_views: 0,
      status,
      submitted_by: payload.submittedBy ?? null,
      created_at: now,
    },
    sources,
  );
}

export async function updateVideoStatus(
  id: string,
  status: VideoStatus,
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;

  await db.execute({
    sql: "UPDATE videos SET status = ?, updated_at = ? WHERE id = ?",
    args: [status, new Date().toISOString(), id],
  });
  return true;
}

export async function updateVideoInDb(
  id: string,
  data: {
    title: string;
    category: Video["category"];
    tags: string[];
    publishedDate: string;
    thumbnail: string;
    sources: { platform: string; url: string }[];
  },
): Promise<Video | null> {
  const db = getClient();
  if (!db) return null;

  const now = new Date().toISOString();
  const year = Number(data.publishedDate.slice(0, 4));
  const tags = dedupeTags(data.tags);

  try {
    await db.execute({
      sql: `UPDATE videos
            SET title = ?, category = ?, tags = ?, year = ?, published_date = ?, thumbnail = ?, updated_at = ?
            WHERE id = ?`,
      args: [
        data.title,
        data.category,
        JSON.stringify(tags),
        year,
        data.publishedDate,
        data.thumbnail,
        now,
        id,
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes("published_date")) throw err;

    await db.execute({
      sql: `UPDATE videos
            SET title = ?, category = ?, tags = ?, year = ?, thumbnail = ?, updated_at = ?
            WHERE id = ?`,
      args: [
        data.title,
        data.category,
        JSON.stringify(tags),
        year,
        data.thumbnail,
        now,
        id,
      ],
    });
  }

  await db.execute({
    sql: "DELETE FROM video_sources WHERE video_id = ?",
    args: [id],
  });

  for (const [i, source] of data.sources.entries()) {
    const sourceId = `${id}-src-${i}`;
    await db.execute({
      sql: "INSERT INTO video_sources (id, video_id, platform, url) VALUES (?, ?, ?, ?)",
      args: [sourceId, id, source.platform, source.url],
    });
  }

  return getVideoById(id);
}

export async function deleteVideo(id: string): Promise<boolean> {
  const db = getClient();
  if (!db) return false;

  await db.execute({ sql: "DELETE FROM video_sources WHERE video_id = ?", args: [id] });
  await db.execute({ sql: "DELETE FROM videos WHERE id = ?", args: [id] });
  return true;
}

export async function incrementSiteViews(id: string): Promise<number | null> {
  const db = getClient();
  if (!db) return null;

  await db.execute({
    sql: "UPDATE videos SET site_views = site_views + 1 WHERE id = ?",
    args: [id],
  });

  const { rows } = await db.execute({
    sql: "SELECT site_views FROM videos WHERE id = ?",
    args: [id],
  });
  return (rows[0]?.site_views as number) ?? null;
}

export async function updateSourceViewCount(
  sourceId: string,
  viewCount: number,
): Promise<void> {
  const db = getClient();
  if (!db) return;

  await db.execute({
    sql: "UPDATE video_sources SET view_count = ?, view_count_updated_at = ? WHERE id = ?",
    args: [viewCount, new Date().toISOString(), sourceId],
  });
}

// --- Users ---

export async function getUserCount(): Promise<number> {
  const db = getClient();
  if (!db) return 0;
  const { rows } = await db.execute("SELECT COUNT(*) as c FROM users");
  return (rows[0]?.c as number) ?? 0;
}

export async function getUserByUsername(
  username: string,
): Promise<(User & { passwordHash: string }) | null> {
  const db = getClient();
  if (!db) return null;

  const { rows } = await db.execute({
    sql: "SELECT * FROM users WHERE username = ?",
    args: [username.toLowerCase()],
  });
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id as string,
    username: row.username as string,
    displayName: (row.display_name as string | null) ?? null,
    role: row.role as UserRole,
    createdAt: row.created_at as string,
    passwordHash: row.password_hash as string,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const db = getClient();
  if (!db) return null;

  const { rows } = await db.execute({
    sql: "SELECT id, username, display_name, role, created_at FROM users WHERE id = ?",
    args: [id],
  });
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id as string,
    username: row.username as string,
    displayName: (row.display_name as string | null) ?? null,
    role: row.role as UserRole,
    createdAt: row.created_at as string,
  };
}

export async function createUser(data: {
  id: string;
  username: string;
  passwordHash: string;
  displayName?: string;
  role?: UserRole;
}): Promise<User | null> {
  const db = getClient();
  if (!db) return null;

  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO users (id, username, password_hash, display_name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      data.id,
      data.username.toLowerCase(),
      data.passwordHash,
      data.displayName ?? null,
      data.role ?? "user",
      now,
    ],
  });

  return {
    id: data.id,
    username: data.username.toLowerCase(),
    displayName: data.displayName ?? null,
    role: data.role ?? "user",
    createdAt: now,
  };
}

// --- Favorites ---

export async function getUserFavorites(userId: string): Promise<string[]> {
  const db = getClient();
  if (!db) return [];

  const { rows } = await db.execute({
    sql: "SELECT video_id FROM favorites WHERE user_id = ?",
    args: [userId],
  });
  return rows.map((r) => r.video_id as string);
}

export async function syncUserFavorites(
  userId: string,
  videoIds: string[],
): Promise<string[]> {
  const db = getClient();
  if (!db) return videoIds;

  const existing = await getUserFavorites(userId);
  const merged = [...new Set([...existing, ...videoIds])];

  for (const videoId of merged) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO favorites (user_id, video_id) VALUES (?, ?)",
      args: [userId, videoId],
    });
  }

  return merged;
}

export async function toggleUserFavorite(
  userId: string,
  videoId: string,
): Promise<boolean> {
  const db = getClient();
  if (!db) return false;

  const { rows } = await db.execute({
    sql: "SELECT 1 FROM favorites WHERE user_id = ? AND video_id = ?",
    args: [userId, videoId],
  });

  if (rows.length > 0) {
    await db.execute({
      sql: "DELETE FROM favorites WHERE user_id = ? AND video_id = ?",
      args: [userId, videoId],
    });
    return false;
  }

  await db.execute({
    sql: "INSERT INTO favorites (user_id, video_id) VALUES (?, ?)",
    args: [userId, videoId],
  });
  return true;
}

// --- Comments ---

export async function getCommentsByVideoId(videoId: string): Promise<Comment[]> {
  const db = getClient();
  if (!db) return [];

  const { rows } = await db.execute({
    sql: "SELECT * FROM comments WHERE video_id = ? ORDER BY created_at DESC",
    args: [videoId],
  });

  return rows.map((r) => ({
    id: r.id as string,
    videoId: r.video_id as string,
    nickname: (r.nickname as string | null) ?? null,
    content: r.content as string,
    userId: (r.user_id as string | null) ?? null,
    createdAt: r.created_at as string,
  }));
}

export async function insertComment(data: {
  id: string;
  videoId: string;
  content: string;
  nickname?: string | null;
  userId?: string | null;
}): Promise<Comment | null> {
  const db = getClient();
  if (!db) return null;

  const now = new Date().toISOString();
  await db.execute({
    sql: "INSERT INTO comments (id, video_id, nickname, content, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [
      data.id,
      data.videoId,
      data.nickname ?? null,
      data.content,
      data.userId ?? null,
      now,
    ],
  });

  return {
    id: data.id,
    videoId: data.videoId,
    nickname: data.nickname ?? null,
    content: data.content,
    userId: data.userId ?? null,
    createdAt: now,
  };
}

// --- Starter picks (入坑必看) ---

async function ensureStarterPicksTable(db: Client): Promise<void> {
  if (starterPicksTableReady) return;

  await db.execute(`CREATE TABLE IF NOT EXISTS starter_picks (
    video_id TEXT PRIMARY KEY,
    sort_order INTEGER NOT NULL DEFAULT 0,
    added_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
  )`);
  await db.execute(
    "CREATE INDEX IF NOT EXISTS idx_starter_picks_sort ON starter_picks(sort_order)",
  );
  starterPicksTableReady = true;
}

export async function getStarterVideoIdsFromDb(): Promise<string[] | null> {
  const db = getClient();
  if (!db) return null;

  try {
    await ensureStarterPicksTable(db);
    const { rows } = await db.execute(
      "SELECT video_id FROM starter_picks ORDER BY sort_order ASC, created_at ASC",
    );
    return rows.map((r) => r.video_id as string);
  } catch {
    return null;
  }
}

export async function getStarterVideosFromDb(): Promise<Video[] | null> {
  const db = getClient();
  if (!db) return null;

  try {
    await ensureStarterPicksTable(db);
    const { rows } = await db.execute(`
      SELECT v.* FROM videos v
      INNER JOIN starter_picks sp ON sp.video_id = v.id
      WHERE v.status = 'approved'
      ORDER BY sp.sort_order ASC, sp.created_at ASC
    `);

    const videos: Video[] = [];
    for (const row of rows) {
      const sources = await loadSources(db, row.id as string);
      videos.push(rowToVideo(row as Record<string, unknown>, sources));
    }
    return videos;
  } catch {
    return null;
  }
}

export async function addStarterVideosToDb(
  videoIds: string[],
  addedBy?: string | null,
): Promise<{ added: string[]; skipped: string[]; invalid: string[] } | null> {
  const db = getClient();
  if (!db) return null;

  try {
    await ensureStarterPicksTable(db);

    const added: string[] = [];
    const skipped: string[] = [];
    const invalid: string[] = [];

    const { rows: maxRows } = await db.execute(
      "SELECT COALESCE(MAX(sort_order), -1) as m FROM starter_picks",
    );
    let nextOrder = ((maxRows[0]?.m as number) ?? -1) + 1;

    const { rows: existingRows } = await db.execute(
      "SELECT video_id FROM starter_picks",
    );
    const existing = new Set(existingRows.map((r) => r.video_id as string));

    for (const videoId of videoIds) {
      if (existing.has(videoId)) {
        skipped.push(videoId);
        continue;
      }

      const { rows } = await db.execute({
        sql: "SELECT id, status FROM videos WHERE id = ?",
        args: [videoId],
      });

      if (rows.length === 0 || (rows[0].status as string) !== "approved") {
        invalid.push(videoId);
        continue;
      }

      await db.execute({
        sql: "INSERT INTO starter_picks (video_id, sort_order, added_by) VALUES (?, ?, ?)",
        args: [videoId, nextOrder, addedBy ?? null],
      });
      nextOrder += 1;
      added.push(videoId);
      existing.add(videoId);
    }

    return { added, skipped, invalid };
  } catch (err) {
    console.error("addStarterVideosToDb failed:", err);
    return null;
  }
}

export async function removeStarterVideoFromDb(videoId: string): Promise<boolean | null> {
  const db = getClient();
  if (!db) return null;

  try {
    await ensureStarterPicksTable(db);
    await db.execute({
      sql: "DELETE FROM starter_picks WHERE video_id = ?",
      args: [videoId],
    });
    return true;
  } catch (err) {
    console.error("removeStarterVideoFromDb failed:", err);
    return null;
  }
}

export async function reorderStarterVideosInDb(videoIds: string[]): Promise<boolean | null> {
  const db = getClient();
  if (!db) return null;

  try {
    await ensureStarterPicksTable(db);
    for (const [i, videoId] of videoIds.entries()) {
      await db.execute({
        sql: "UPDATE starter_picks SET sort_order = ? WHERE video_id = ?",
        args: [i, videoId],
      });
    }
    return true;
  } catch (err) {
    console.error("reorderStarterVideosInDb failed:", err);
    return null;
  }
}
