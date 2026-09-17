import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { defaultContent } from "./content-data";
import { applyContentOverrides } from "./content-overrides";
import type { GalleryItem, SiteContent } from "./content-types";
import { db } from "./db";
import { siteSettings } from "./db/schema";

const contentPath = path.join(process.cwd(), "data", "site-content.json");
const singletonId = "singleton";

type LegacyGalleryAlbum = { visible: boolean; images: Omit<GalleryItem, "visible">[] };
type StoredGalleryEntry = GalleryItem | LegacyGalleryAlbum;

function normalizeSiteContent(content: SiteContent): SiteContent {
  const entries = (content.galleries as unknown as StoredGalleryEntry[] | undefined) ?? [];
  const galleries = entries
    .flatMap((entry) => "images" in entry ? entry.images.map((image) => ({ ...image, visible: entry.visible })) : [entry])
    .sort((a, b) => a.order - b.order);

  return { ...content, galleries };
}

async function getFileContent(): Promise<SiteContent> {
  try {
    const stored = JSON.parse(await fs.readFile(contentPath, "utf8")) as SiteContent;
    return normalizeSiteContent(applyContentOverrides(stored));
  } catch {
    return normalizeSiteContent(applyContentOverrides(defaultContent));
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  if (db) {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, singletonId)).limit(1);
    if (rows[0]?.data) return normalizeSiteContent(rows[0].data as SiteContent);
  }
  return getFileContent();
}

export async function saveSiteContent(content: SiteContent) {
  if (db) {
    await db.insert(siteSettings).values({ id: singletonId, data: content }).onConflictDoUpdate({ target: siteSettings.id, set: { data: content, updatedAt: new Date() } });
    return content;
  }
  await fs.mkdir(path.dirname(contentPath), { recursive: true });
  await fs.writeFile(contentPath, JSON.stringify(content, null, 2), "utf8");
  return content;
}