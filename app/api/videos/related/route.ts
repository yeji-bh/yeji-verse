import { NextResponse } from "next/server";
import { getRelatedVideosFromDb } from "@/db/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 5, 1), 10);
  const videos = await getRelatedVideosFromDb(id, limit);
  return NextResponse.json(videos ?? []);
}
