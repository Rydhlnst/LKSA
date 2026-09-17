import { defaultContent } from "./content-data.ts";
import type { SiteContent } from "./content-types.ts";

export const CANONICAL_CONTENT_VERSION = 2;

function mergeFields<T>(existing: T | undefined, seed: T): T {
  if (existing == null || (typeof existing === "string" && !existing.trim())) return structuredClone(seed);
  if (Array.isArray(seed)) return structuredClone(Array.isArray(existing) && existing.length ? existing : seed);
  if (typeof seed === "object" && seed !== null) {
    const result = { ...existing };
    for (const key of Object.keys(seed) as (keyof T)[]) {
      result[key] = mergeFields(existing[key], seed[key]);
    }
    return result;
  }
  return existing;
}

function mergeCollection<T extends { id: string }>(existing: T[] = [], seed: T[], fillFields = false): T[] {
  const seedById = new Map(seed.map((item) => [item.id, item]));
  const result = existing.map((item) => fillFields && seedById.has(item.id)
    ? mergeFields(item, seedById.get(item.id)!)
    : structuredClone(item));
  const ids = new Set(existing.map((item) => item.id));
  for (const item of seed) {
    if (!ids.has(item.id)) {
      result.push(structuredClone(item));
      ids.add(item.id);
    }
  }
  return result;
}

export function mergeSeedContent(existing: SiteContent, seed: SiteContent): SiteContent {
  return {
    ...existing,
    contentVersion: Math.max(existing.contentVersion ?? 0, seed.contentVersion ?? 0),
    settings: mergeFields(existing.settings, seed.settings),
    home: mergeFields(existing.home, seed.home),
    donation: mergeFields(existing.donation, seed.donation),
    heroSlides: mergeCollection(existing.heroSlides, seed.heroSlides),
    homeValues: mergeCollection(existing.homeValues, seed.homeValues),
    pages: mergeCollection(existing.pages, seed.pages, true),
    organization: mergeCollection(existing.organization, seed.organization),
    schedule: mergeCollection(existing.schedule, seed.schedule),
    articles: mergeCollection(existing.articles, seed.articles),
    galleries: mergeCollection(existing.galleries, seed.galleries),
    documents: mergeCollection(existing.documents, seed.documents),
    ledger: mergeCollection(existing.ledger, seed.ledger),
    donors: mergeCollection(existing.donors, seed.donors),
  };
}

export async function seedCanonicalContent(): Promise<{ inserted: boolean; content: SiteContent }> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to seed canonical content.");
  const [{ db }, { siteSettings }, { eq }] = await Promise.all([
    import("./db/index.ts"),
    import("./db/schema.ts"),
    import("drizzle-orm"),
  ]);
  if (!db) throw new Error("DATABASE_URL is required to seed canonical content.");

  return db.transaction(async (tx) => {
    const seed = { ...defaultContent, contentVersion: CANONICAL_CONTENT_VERSION };
    const inserted = await tx.insert(siteSettings).values({ id: "singleton", data: seed })
      .onConflictDoNothing({ target: siteSettings.id }).returning();
    if (inserted[0]) return { inserted: true, content: inserted[0].data as SiteContent };

    const [existing] = await tx.select().from(siteSettings).where(eq(siteSettings.id, "singleton")).for("update");
    if (!existing) throw new Error("Canonical content source is unavailable.");
    const content = mergeSeedContent(existing.data as SiteContent, seed);
    const [stored] = await tx.update(siteSettings).set({ data: content, updatedAt: new Date() })
      .where(eq(siteSettings.id, "singleton")).returning();
    return { inserted: false, content: stored.data as SiteContent };
  });
}
