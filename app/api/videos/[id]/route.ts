import { NextResponse } from "next/server";
import { deleteVideo, updateVideoInDb, updateVideoStatus } from "@/db/client";
import { dedupeTags } from "@/lib/tags";
import { requireAdmin } from "@/lib/session";
import type { Category, VideoStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.title) {
    const source = body.sources?.[0];
    if (!source?.url) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    const video = await updateVideoInDb(id, {
      title: String(body.title).trim(),
      category: body.category as Category,
      tags: dedupeTags(body.tags ?? []),
      publishedDate: body.publishedDate,
      thumbnail: body.thumbnail ?? "",
      sources: [
        {
          platform: source.platform ?? "other",
          url: String(source.url).trim(),
        },
      ],
    });

    if (!video) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json(video);
  }

  const { status } = body;
  if (!["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await updateVideoStatus(id, status as VideoStatus);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await deleteVideo(id);
  return NextResponse.json({ ok: true });
}
