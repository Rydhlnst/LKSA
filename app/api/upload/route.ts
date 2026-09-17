import { promises as fs } from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

const allowed = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const maxFileSize = 5 * 1024 * 1024;

const r2Config = {
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.R2_REGION ?? "auto",
  bucket: process.env.R2_BUCKET,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  publicUrl: process.env.R2_PUBLIC_URL,
};
const hasAnyR2Config = Object.values(r2Config).some(Boolean);
const hasCompleteR2Config = Object.values(r2Config).every(Boolean);
const r2Client = hasCompleteR2Config ? new S3Client({ endpoint: r2Config.endpoint, region: r2Config.region, credentials: { accessKeyId: r2Config.accessKeyId!, secretAccessKey: r2Config.secretAccessKey! } }) : null;

function storageError() { return NextResponse.json({ error: "Penyimpanan media belum dikonfigurasi dengan lengkap." }, { status: 500 }); }

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (hasAnyR2Config && !hasCompleteR2Config) return storageError();

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "File wajib dipilih." }, { status: 400 });
  const extension = allowed.get(file.type);
  if (!extension) return NextResponse.json({ error: "Gunakan JPG, PNG, atau WebP." }, { status: 400 });
  if (file.size > maxFileSize) return NextResponse.json({ error: "Ukuran maksimal 5 MB." }, { status: 400 });

  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (r2Client && r2Config.bucket && r2Config.publicUrl) {
      const key = `uploads/${filename}`;
      await r2Client.send(new PutObjectCommand({ Bucket: r2Config.bucket, Key: key, Body: buffer, ContentType: file.type, CacheControl: "public, max-age=31536000, immutable" }));
      return NextResponse.json({ url: `${r2Config.publicUrl.replace(/\/$/, "")}/${key}` });
    }

    const directory = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, filename), buffer);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch {
    return NextResponse.json({ error: "Upload gagal. Silakan coba lagi." }, { status: 502 });
  }
}