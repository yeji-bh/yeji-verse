import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { syncUserFavorites } from "@/db/client";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await request.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const merged = await syncUserFavorites(user.id, ids as string[]);
  return NextResponse.json({ ids: merged });
}
