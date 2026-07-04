import { NextResponse } from "next/server";
import { getPopularTagsFromDb } from "@/db/client";
import { SIDEBAR_TAG_LIMIT } from "@/lib/constants";

export async function GET() {
  const tags = await getPopularTagsFromDb(SIDEBAR_TAG_LIMIT);
  return NextResponse.json(tags ?? [], {
    headers: {
      "Cache-Control":
        "public, max-age=60, s-maxage=120, stale-while-revalidate=600",
    },
  });
}
