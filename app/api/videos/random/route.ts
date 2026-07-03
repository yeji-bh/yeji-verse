import { NextResponse } from "next/server";
import { getRandomVideoFromDb } from "@/db/client";

export async function GET() {
  const video = await getRandomVideoFromDb();

  if (!video) {
    return NextResponse.json({ error: "No videos" }, { status: 404 });
  }

  return NextResponse.json(video);
}
