import { NextResponse } from "next/server";
import { getCommentsByVideoId, insertComment } from "@/db/client";
import { getSessionUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const comments = await getCommentsByVideoId(id);
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: videoId } = await params;
  const { content, nickname } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  }

  const user = await getSessionUser();
  const comment = await insertComment({
    id: crypto.randomUUID(),
    videoId,
    content: content.trim(),
    nickname: nickname?.trim() || null,
    userId: user?.id ?? null,
  });

  if (!comment) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  return NextResponse.json(comment, { status: 201 });
}
