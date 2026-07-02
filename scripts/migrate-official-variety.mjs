/**
 * Merge officialVariety (管綜) into variety (綜藝).
 * Usage: TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node scripts/migrate-official-variety.mjs
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const client = createClient({ url, authToken });

const countResult = await client.execute({
  sql: "SELECT COUNT(*) AS n FROM videos WHERE category = ?",
  args: ["officialVariety"],
});
const count = Number(countResult.rows[0]?.n ?? 0);

if (count === 0) {
  console.log("No videos with category officialVariety — nothing to migrate.");
  process.exit(0);
}

await client.execute({
  sql: `UPDATE videos SET category = ?, updated_at = datetime('now') WHERE category = ?`,
  args: ["variety", "officialVariety"],
});

console.log(`Migrated ${count} video(s) from officialVariety → variety.`);
