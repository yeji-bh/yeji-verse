import { createClient, type Client } from "@libsql/client";
import type { Video, VideoSource, SubmitVideoPayload } from "@/lib/types";

let client: Client | null = null;

function getClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) return null;

  if (!client) {
    client = createClient({ url, authToken });
  }

  return client;
}

function rowToVideo(
  row: Record<string, unknown>,
  sources: VideoSource[],
): Video {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    category: row.category as Video["category"],
    tags: JSON.parse((row.tags as string) || "[]"),
    year: row.year as number,
    thumbnail: (row.thumbnail as string) ?? "",
    siteViews: (row.site_views as number) ?? 0,
    createdAt: row.created_at as string,
    sources,
  };
}

export async function getVideosFromDb(): Promise<Video[] | null> {
  const db = getClient();
  if (!db) return null;

  const { rows } = await db.execute("SELECT * FROM videos ORDER BY created_at DESC");
  const videos: Video[] = [];

  for (const row of rows) {
    const { rows: sourceRows } = await db.execute({
      sql: "SELECT * FROM video_sources WHERE video_id = ?",
      args: [row.id as string],
    });

    const sources: VideoSource[] = sourceRows.map((s) => ({
      id: s.id as string,
      platform: s.platform as string,
      url: s.url as string,
      viewCount: (s.view_count as number | null) ?? null,
      viewCountUpdatedAt: (s.view_count_updated_at as string | null) ?? null,
    }));

    videos.push(rowToVideo(row as Record<string, unknown>, sources));
  }

  return videos;
}

export async function insertVideoToDb(
  payload: SubmitVideoPayload & { id: string; thumbnail: string },
): Promise<Video | null> {
  const db = getClient();
  if (!db) return null;

  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO videos (id, title, description, category, tags, year, thumbnail, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      payload.id,
      payload.title,
      payload.description,
      payload.category,
      JSON.stringify(payload.tags),
      payload.year,
      payload.thumbnail,
      now,
      now,
    ],
  });

  const sources: VideoSource[] = [];

  for (const [i, source] of payload.sources.entries()) {
    const sourceId = `${payload.id}-src-${i}`;
    await db.execute({
      sql: `INSERT INTO video_sources (id, video_id, platform, url) VALUES (?, ?, ?, ?)`,
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
      description: payload.description,
      category: payload.category,
      tags: JSON.stringify(payload.tags),
      year: payload.year,
      thumbnail: payload.thumbnail,
      site_views: 0,
      created_at: now,
    },
    sources,
  );
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
    sql: `UPDATE video_sources SET view_count = ?, view_count_updated_at = ? WHERE id = ?`,
    args: [viewCount, new Date().toISOString(), sourceId],
  });
}
