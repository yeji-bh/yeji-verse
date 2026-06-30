import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { User, UserRole } from "@/lib/types";

const COOKIE_NAME = "yeji_session";
const SESSION_DAYS = 30;

// 登入仍用帳號密碼驗證；此 secret 僅用於簽署登入後的 session cookie，本機可留空
function getSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  const value = secret || "yeji-verse-dev-secret-change-in-production";
  return new TextEncoder().encode(value);
}

export { COOKIE_NAME };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: Pick<User, "id" | "username" | "role">) {
  return new SignJWT({ sub: user.id, username: user.username, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<{ id: string; username: string; role: UserRole } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.username !== "string") return null;
    return {
      id: payload.sub,
      username: payload.username,
      role: (payload.role as UserRole) ?? "user",
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_DAYS * 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
