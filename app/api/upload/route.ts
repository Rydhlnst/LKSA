import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

export async function POST(request: Request) { if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File)) return NextResponse.json({ error: "File wajib dipilih." }, { status: 400 }); const extension = allowed.get(file.type); if (!extension) return NextResponse.json({ error: "Gunakan JPG, PNG, atau WebP." }, { status: 400 }); if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Ukuran maksimal 5 MB." }, { status: 400 }); const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`; const directory = path.join(process.cwd(), "public", "uploads"); await fs.mkdir(directory, { recursive: true }); await fs.writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer())); return NextResponse.json({ url: `/uploads/${filename}` }); }
