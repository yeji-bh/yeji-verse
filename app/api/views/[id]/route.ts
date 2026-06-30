import { NextResponse } from "next/server";
import { mockVideos } from "@/data/mock-videos";
import { incrementSiteViews } from "@/db/client";

let memoryViews: Record<string, number> = Object.fromEntries(
  mockVideos.map((v) => [v.id, v.siteViews]),
);

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const dbViews = await incrementSiteViews(id);
  if (dbViews !== null) {
    return NextResponse.json({ siteViews: dbViews });
  }

  memoryViews[id] = (memoryViews[id] ?? 0) + 1;
  return NextResponse.json({ siteViews: memoryViews[id] });
}
