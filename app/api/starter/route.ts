import { NextResponse } from "next/server";
import {
  addStarterVideosToDb,
  getStarterVideosFromDb,
  getVideosFromDb,
  removeStarterVideoFromDb,
  reorderStarterVideosInDb,
} from "@/db/client";
import { requireAdmin } from "@/lib/session";
import type { Video } from "@/lib/types";

let memoryStarterIds: string[] = [];

function getMemoryStarterVideos(allVideos: Video[]): Video[] {
  const byId = new Map(allVideos.map((v) => [v.id, v]));
  return memoryStarterIds
    .map((id) => byId.get(id))
    .filter((v): v is Video => !!v && v.status === "approved");
}

export async function GET() {
  const dbVideos = await getStarterVideosFromDb();
  if (dbVideos !== null) {
    return NextResponse.json(dbVideos);
  }

  const all = (await getVideosFromDb("approved")) ?? [];
  return NextResponse.json(getMemoryStarterVideos(all));
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const videoIds = Array.isArray(body.videoIds)
      ? (body.videoIds as string[]).filter((id) => typeof id === "string" && id.trim())
      : [];

    if (videoIds.length === 0) {
      return NextResponse.json({ error: "No video IDs provided" }, { status: 400 });
    }

    const result = await addStarterVideosToDb(videoIds, admin.id);
    if (result) {
      const videos = await getStarterVideosFromDb();
      return NextResponse.json({ ...result, videos: videos ?? [] });
    }

    const all = (await getVideosFromDb("approved")) ?? [];
    const approvedIds = new Set(all.filter((v) => v.status === "approved").map((v) => v.id));
    const added: string[] = [];
    const skipped: string[] = [];
    const invalid: string[] = [];

    for (const id of videoIds) {
      if (!approvedIds.has(id)) {
        invalid.push(id);
        continue;
      }
      if (memoryStarterIds.includes(id)) {
        skipped.push(id);
        continue;
      }
      memoryStarterIds.push(id);
      added.push(id);
    }

    return NextResponse.json({
      added,
      skipped,
      invalid,
      videos: getMemoryStarterVideos(all),
    });
  } catch (err) {
    console.error("POST /api/starter failed:", err);
    return NextResponse.json({ error: "Failed to add starter picks" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const videoId = body.videoId as string | undefined;
  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  const removed = await removeStarterVideoFromDb(videoId);
  if (removed !== null) {
    const videos = await getStarterVideosFromDb();
    return NextResponse.json({ videos: videos ?? [] });
  }

  memoryStarterIds = memoryStarterIds.filter((id) => id !== videoId);
  const all = (await getVideosFromDb("approved")) ?? [];
  return NextResponse.json({ videos: getMemoryStarterVideos(all) });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const videoIds = Array.isArray(body.videoIds)
    ? (body.videoIds as string[]).filter((id) => typeof id === "string" && id.trim())
    : [];

  const ok = await reorderStarterVideosInDb(videoIds);
  if (ok !== null) {
    const videos = await getStarterVideosFromDb();
    return NextResponse.json({ videos: videos ?? [] });
  }

  const pickSet = new Set(memoryStarterIds);
  memoryStarterIds = [
    ...videoIds.filter((id) => pickSet.has(id)),
    ...memoryStarterIds.filter((id) => !videoIds.includes(id)),
  ];

  const all = (await getVideosFromDb("approved")) ?? [];
  return NextResponse.json({ videos: getMemoryStarterVideos(all) });
}
