import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Execute production TS with only framework/auth/storage boundaries replaced.
function loadModule(path, dependencies = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, Date, structuredClone,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  }, { filename: path });
  return exports;
}

const { defaultContent } = loadModule("lib/content-data.ts");
const { mergeSeedContent } = loadModule("lib/content-seed.ts", {
  "./content-data.ts": { defaultContent },
});

test("seed pages provide the section copy used by structured public routes", () => {
  const bySlug = Object.fromEntries(defaultContent.pages.map((page) => [page.slug, page]));
  assert.equal(defaultContent.pages.length, 8);
  assert.ok(defaultContent.pages.every((page) => page.status === "published" && page.eyebrow));
  assert.deepEqual(structuredClone(bySlug.donasi.sections), {
    account: { eyebrow: "", title: "Rekening Donasi", description: "Mohon cek kembali nama rekening sebelum transfer dan konfirmasi melalui WhatsApp resmi LKSA." },
    transparency: { eyebrow: "Transparansi", title: "Transparansi dan Legalitas Donasi", description: "" },
    legal: { eyebrow: "Legalitas", title: "Dokumen pendukung donasi", description: "Dokumen resmi berikut disediakan untuk membantu calon donatur mengenal profil, legalitas, dan struktur pengelolaan LKSA." },
  });
  assert.deepEqual(structuredClone(bySlug["jadwal-kegiatan"].sections), {
    weekday: { eyebrow: "", title: "Hari Efektif Senin–Jumat", description: "" },
    weekend: { eyebrow: "", title: "Hari Sabtu & Ahad", description: "" },
  });
  assert.deepEqual(structuredClone(bySlug["struktur-organisasi"].sections), {
    organigram: { eyebrow: "Organigram", title: "Bersama menjalankan amanah pengasuhan", description: "Pengurus, pengasuh, pendamping pendidikan, dan relawan bekerja bersama untuk menjaga layanan anak asuh." },
  });
});

test("seed merge fills legacy sections and preserves customized section copy", () => {
  const legacy = structuredClone(defaultContent);
  for (const page of legacy.pages) { delete page.eyebrow; delete page.sections; }
  const merged = mergeSeedContent(legacy, defaultContent);
  const donation = merged.pages.find((page) => page.slug === "donasi");
  assert.equal(donation.sections?.account?.title, "Rekening Donasi");
  assert.ok(merged.pages.every((page) => page.eyebrow && page.sections));
  donation.sections.account.title = "Custom account heading";
  const again = mergeSeedContent(merged, defaultContent);
  assert.equal(again.pages.find((page) => page.slug === "donasi").sections.account.title, "Custom account heading");
  assert.deepEqual(structuredClone(mergeSeedContent(again, defaultContent)), structuredClone(again));
});

async function savePage(content, fields) {
  let saved;
  const events = [];
  const { savePageAction } = loadModule("app/admin/actions.ts", {
    "next/cache": { revalidatePath: (path) => events.push(path) },
    "next/navigation": { redirect: (path) => { throw new Error(`redirect:${path}`); } },
    "@/lib/auth": { requireAdmin: async () => events.push("authenticated") },
    "@/lib/content-store": {
      getSiteContent: async () => { assert.equal(events[0], "authenticated"); return content; },
      saveSiteContent: async (data) => { saved = structuredClone(data); },
    },
    "@/lib/media-storage": {}, "@/lib/media-references": {}, "@/lib/validation": {},
  });
  const form = new FormData();
  for (const [key, entry] of Object.entries(fields)) form.set(key, entry);
  await assert.rejects(savePageAction(form), { message: "redirect:/admin/pages?saved=1" });
  assert.ok(saved);
  assert.ok(events.includes(`/${fields.slug}`));
  return saved;
}

test("saving an existing page preserves its eyebrow and sections without form fields", async () => {
  const content = structuredClone(defaultContent);
  const before = content.pages.find((page) => page.id === "page-donation");
  before.eyebrow = "Custom eyebrow";
  before.sections = { account: { eyebrow: "", title: "Custom account heading", description: "Custom notice" } };
  const saved = await savePage(content, {
    id: before.id, slug: "donasi", title: "Edited title", intro: "Edited intro", body: "Edited body", status: "published",
  });
  const after = saved.pages.find((page) => page.id === before.id);
  assert.equal(after.eyebrow, "Custom eyebrow");
  assert.deepEqual(after.sections, { account: { eyebrow: "", title: "Custom account heading", description: "Custom notice" } });
  assert.equal(after.title, "Edited title");
  assert.equal(after.intro, "Edited intro");
  assert.equal(saved.pages.length, 8);
});

test("an existing intentionally empty eyebrow is preserved", async () => {
  const content = structuredClone(defaultContent);
  const page = content.pages.find((item) => item.id === "page-about");
  page.eyebrow = "";
  const saved = await savePage(content, {
    id: page.id, slug: page.slug, title: page.title, status: page.status,
  });
  assert.equal(saved.pages.find((item) => item.id === page.id).eyebrow, "");
});

test("new pages receive a safe eyebrow and empty sections until editor support", async () => {
  const saved = await savePage(structuredClone(defaultContent), {
    slug: "new-page", title: "New page", intro: "", body: "", status: "draft",
  });
  const created = saved.pages.find((page) => page.slug === "new-page");
  assert.equal(created.eyebrow, "Profil Panti");
  assert.deepEqual(created.sections, {});
  assert.equal(saved.pages.length, 9);
});

test("saving a legacy page supplies missing fields without replacing its ID", async () => {
  const content = structuredClone(defaultContent);
  const legacy = content.pages.find((page) => page.id === "page-about");
  delete legacy.eyebrow;
  delete legacy.sections;
  const saved = await savePage(content, {
    id: legacy.id, slug: legacy.slug, title: legacy.title, status: legacy.status,
  });
  const after = saved.pages.find((page) => page.id === legacy.id);
  assert.equal(after.eyebrow, "Profil Panti");
  assert.deepEqual(after.sections, {});
  assert.equal(saved.pages.length, 8);
});
