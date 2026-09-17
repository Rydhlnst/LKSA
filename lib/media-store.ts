import "server-only";

import { desc } from "drizzle-orm";
import { db } from "./db";
import { mediaAssets } from "./db/schema";

export async function getMediaAssets() {
  if (!db) return [];
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt));
}
