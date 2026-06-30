import { NextResponse } from "next/server";
import { incrementSiteViews } from "@/db/client";

let memoryViews: Record<string, number> = {};

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
