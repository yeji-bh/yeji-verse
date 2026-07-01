import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserChecklist, toggleUserChecklist } from "@/db/client";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ids = await getUserChecklist(user.id);
  return NextResponse.json({ ids });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = await request.json();
  if (!videoId) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  await toggleUserChecklist(user.id, videoId);
  const ids = await getUserChecklist(user.id);
  return NextResponse.json({ ids });
}
