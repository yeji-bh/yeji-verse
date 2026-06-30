import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  createSessionToken,
  hashPassword,
  sessionCookieOptions,
} from "@/lib/auth";
import { createUser, getUserByUsername, getUserCount } from "@/db/client";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username?.trim() || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const normalized = username.trim().toLowerCase();
    const existing = await getUserByUsername(normalized);
    if (existing) {
      return NextResponse.json({ error: "Username taken" }, { status: 409 });
    }

    const userCount = await getUserCount();
    const role = userCount === 0 ? "admin" : "user";

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const user = await createUser({
      id,
      username: normalized,
      passwordHash,
      role,
    });

    if (!user) {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const token = await createSessionToken(user);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, sessionCookieOptions());

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
