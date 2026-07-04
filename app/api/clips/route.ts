import { NextResponse } from "next/server";
import {
  addUserClipBookmark,
  deleteUserClipBookmark,
  getUserClipBookmarks,
} from "@/db/client";
import { createId } from "@/lib/id";
import { getSessionUser } from "@/lib/session";
import type { ClipBookmark } from "@/lib/types";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clips = await getUserClipBookmarks(user.id);
  return NextResponse.json({ clips });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const videoId = typeof body.videoId === "string" ? body.videoId : "";
  const startSeconds = Number(body.startSeconds);
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 200) : "";
  const id =
    typeof body.id === "string" && body.id.trim()
      ? body.id.trim()
      : createId();

  if (!videoId || !Number.isFinite(startSeconds) || startSeconds < 0) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const clip = await addUserClipBookmark(user.id, {
    id,
    videoId,
    startSeconds: Math.floor(startSeconds),
    note,
  });

  if (!clip) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  const clips = await getUserClipBookmarks(user.id);
  return NextResponse.json({ clip, clips });
}

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  await deleteUserClipBookmark(user.id, body.id);
  const clips: ClipBookmark[] = await getUserClipBookmarks(user.id);
  return NextResponse.json({ clips });
}
