import assert from "node:assert/strict";
import test from "node:test";
import { defaultContent } from "../lib/content-data.ts";
import { mergeSeedContent, seedCanonicalContent } from "../lib/content-seed.ts";
import type { SiteContent } from "../lib/content-types.ts";

test("seed merge preserves dashboard edits and adds missing records once", () => {
  const existing = structuredClone(defaultContent);
  existing.settings.organizationName = "Edited from dashboard";
  existing.articles = existing.articles.slice(0, 1);
  const merged = mergeSeedContent(existing, defaultContent);
  assert.equal(merged.settings.organizationName, "Edited from dashboard");
  assert.equal(new Set(merged.articles.map((item) => item.id)).size, merged.articles.length);
  assert.equal(merged.articles.length, defaultContent.articles.length);
});

test("running the merge twice does not duplicate collections", () => {
  const first = mergeSeedContent(defaultContent, defaultContent);
  const second = mergeSeedContent(first, defaultContent);
  assert.equal(second.articles.length, first.articles.length);
  assert.equal(second.documents.length, first.documents.length);
  assert.equal(second.galleries.length, first.galleries.length);
  assert.deepEqual(second, first);
});

test("merge fills empty fields while preserving edited home, donation, and page fields", () => {
  const existing = structuredClone(defaultContent);
  existing.settings.phone = "   ";
  existing.donation.accountHolder = "Dashboard account holder";
  existing.donation.accountNumber = "";
  existing.home.about.title = "Dashboard homepage title";
  existing.home.about.description = "";
  existing.pages[0].title = "Dashboard page title";
  existing.pages[0].body = "Dashboard page body";
  existing.pages[0].intro = "";
  const merged = mergeSeedContent(existing, defaultContent);
  assert.equal(merged.settings.phone, "+62 22 4210572");
  assert.equal(merged.donation.accountHolder, "Dashboard account holder");
  assert.equal(merged.donation.accountNumber, "131-00-1673433-3");
  assert.equal(merged.home.about.title, "Dashboard homepage title");
  assert.equal(merged.home.about.description, defaultContent.home.about.description);
  assert.equal(merged.pages[0].title, "Dashboard page title");
  assert.equal(merged.pages[0].body, "Dashboard page body");
  assert.equal(merged.pages[0].intro, defaultContent.pages[0].intro);
  assert.equal(existing.settings.phone, "   ");
  assert.equal(existing.home.about.description, "");
});

test("merge preserves collection order, custom records, and false flags", () => {
  const existing = structuredClone(defaultContent);
  existing.articles = [
    { ...existing.articles[1], title: "Edited article", featured: false },
    { ...existing.articles[0], id: "dashboard-article", status: "draft" },
  ];
  existing.galleries[0].visible = false;
  existing.contentVersion = 4;
  const merged = mergeSeedContent(existing, defaultContent);
  assert.deepEqual(merged.articles.slice(0, 2), existing.articles);
  assert.deepEqual(merged.articles.map((item) => item.id), ["article-2", "dashboard-article", "article-1", "article-rotimu"]);
  assert.equal(merged.galleries[0].visible, false);
  assert.equal(merged.contentVersion, 4);
});

test("merge upgrades legacy aggregates with missing home, version, and collections", () => {
  const legacy: Partial<SiteContent> = structuredClone(defaultContent);
  delete legacy.home;
  delete legacy.contentVersion;
  delete legacy.documents;
  const merged = mergeSeedContent(legacy as SiteContent, defaultContent);
  assert.equal(merged.contentVersion, 2);
  assert.deepEqual(merged.home, defaultContent.home);
  assert.deepEqual(merged.documents.map((item) => item.id), ["doc-sertifikat", "doc-profil", "doc-pendirian", "doc-struktur"]);
});

test("canonical seeding requires DATABASE_URL without logging credentials", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    await assert.rejects(seedCanonicalContent(), { message: "DATABASE_URL is required to seed canonical content." });
  } finally {
    if (previous !== undefined) process.env.DATABASE_URL = previous;
  }
});

test("merge flattens legacy gallery albums before matching image IDs and preserves hidden visibility", () => {
  const seed = structuredClone(defaultContent);
  const hiddenImages = [
    { ...seed.galleries[1], caption: "Dashboard hidden caption", order: 22 },
    { ...seed.galleries[0], url: "/dashboard-image.jpg", alt: "Dashboard alt", order: 21 },
  ];
  const flatImage = { ...seed.galleries[2], caption: "Dashboard flat caption", visible: false };
  const customImage = { ...seed.galleries[0], id: "dashboard-image", caption: "Custom album caption", order: 20 };
  const existing = {
    ...structuredClone(defaultContent),
    galleries: [
      { id: "hidden-album", visible: false, images: hiddenImages },
      flatImage,
      { id: "visible-album", visible: true, images: [customImage] },
    ],
  } as unknown as SiteContent;
  const original = structuredClone(existing);
  const merged = mergeSeedContent(existing, seed);

  // Flatten as the runtime reader does, so nested duplicates cannot evade the assertion.
  const runtimeImages = (merged.galleries as unknown as (
    SiteContent["galleries"][number] | { visible: boolean; images: SiteContent["galleries"] }
  )[]).flatMap((entry) => "images" in entry
    ? entry.images.map((image) => ({ ...image, visible: entry.visible }))
    : [entry]);
  assert.equal(new Set(runtimeImages.map((image) => image.id)).size, runtimeImages.length);
  assert.equal(merged.galleries.length, seed.galleries.length + 1);
  assert.ok(merged.galleries.every((image) => !("images" in image)));
  assert.deepEqual(merged.galleries.slice(0, 4), [
    ...hiddenImages.map((image) => ({ ...image, visible: false })),
    flatImage,
    { ...customImage, visible: true },
  ]);
  assert.equal(merged.galleries.find((image) => image.id === "gallery-1")?.visible, false);
  assert.equal(merged.galleries.find((image) => image.id === "gallery-2")?.visible, false);
  assert.deepEqual(mergeSeedContent(merged, seed), merged);
  assert.deepEqual(existing, original);
});
