import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const cookieName = "lksa_admin_session";
const sessionSecret = process.env.BETTER_AUTH_SECRET ?? "development-only-lksa-secret-change-me";
const defaultEmail = process.env.CMS_ADMIN_EMAIL ?? "admin@lksa.local";
const defaultPassword = process.env.CMS_ADMIN_PASSWORD ?? "admin1234";

function sign(value: string) { return createHmac("sha256", sessionSecret).update(value).digest("base64url"); }
function encodeSession(email: string) { const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString("base64url"); return `${payload}.${sign(payload)}`; }
function verifySession(value: string | undefined) { if (!value) return false; const [payload, signature] = value.split("."); if (!payload || !signature) return false; const expected = sign(payload); if (signature.length !== expected.length) return false; const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); if (!valid) return false; try { const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; exp?: number }; return parsed.email === defaultEmail && typeof parsed.exp === "number" && parsed.exp > Date.now(); } catch { return false; } }
export function credentialsMatch(email: string, password: string) { return email.trim().toLowerCase() === defaultEmail.toLowerCase() && password === defaultPassword; }
export async function createAdminSession(email: string) { const store = await cookies(); store.set(cookieName, encodeSession(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 }); }
export async function destroyAdminSession() { const store = await cookies(); store.delete(cookieName); }
export async function isAdminAuthenticated() { const store = await cookies(); return verifySession(store.get(cookieName)?.value); }
export async function requireAdmin() { if (!(await isAdminAuthenticated())) redirect("/admin/login"); }
export const demoAdminCredentials = { email: defaultEmail, password: defaultPassword };
