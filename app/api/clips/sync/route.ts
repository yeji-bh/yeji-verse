import { NextResponse } from "next/server";
import { syncUserClipBookmarks } from "@/db/client";
import { getSessionUser } from "@/lib/session";
import type { ClipBookmark } from "@/lib/types";

function isClipBookmark(value: unknown): value is ClipBookmark {
  if (!value || typeof value !== "object") return false;
  const c = value as ClipBookmark;
  return (
    typeof c.id === "string" &&
    typeof c.videoId === "string" &&
    typeof c.startSeconds === "number" &&
    Number.isFinite(c.startSeconds) &&
    typeof c.note === "string" &&
    typeof c.createdAt === "string"
  );
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!Array.isArray(body.clips)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const clips = (body.clips as unknown[])
    .filter(isClipBookmark)
    .map((c: ClipBookmark) => ({
      ...c,
      startSeconds: Math.max(0, Math.floor(c.startSeconds)),
      note: c.note.slice(0, 50),
    }));

  const merged = await syncUserClipBookmarks(user.id, clips);
  return NextResponse.json({ clips: merged });
}
