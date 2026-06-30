import { NextResponse } from "next/server";
import {
  deleteComment,
  getCommentById,
  updateComment,
} from "@/db/client";
import { getSessionUser } from "@/lib/session";

async function authorizeCommentOwner(commentId: string) {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const comment = await getCommentById(commentId);
  if (!comment) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  if (comment.userId !== user.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { comment, user };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { commentId } = await params;
  const auth = await authorizeCommentOwner(commentId);
  if ("error" in auth && auth.error) return auth.error;

  const { content } = await request.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Empty comment" }, { status: 400 });
  }

  const updated = await updateComment(commentId, content.trim());
  if (!updated) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { commentId } = await params;
  const auth = await authorizeCommentOwner(commentId);
  if ("error" in auth && auth.error) return auth.error;

  const ok = await deleteComment(commentId);
  if (!ok) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
