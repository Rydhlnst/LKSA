# Single Canonical Content Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Push the existing local LKSA content into the database and make the dashboard-backed content aggregate the only production source for public text, images, documents, news, gallery, donation data, and homepage content.

**Architecture:** Keep the existing `site_settings` singleton JSON aggregate as the canonical content store. Expand its typed contract for homepage and route copy, migrate the complete local seed into that row without duplicating or overwriting dashboard edits, and make public production reads fail clearly when the canonical row is unavailable. Admin server actions continue to write the aggregate and share one public revalidation helper.

**Tech Stack:** Next.js 16 App Router, TypeScript, React Server Components, Server Actions, Drizzle ORM, PostgreSQL/Neon, Zod, existing admin session, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-09-17-single-content-source-design.md`

## Global Constraints

- The production database singleton is the only live public content source.
- Local JSON/default content is bootstrap-only and must not silently serve production requests.
- Existing dashboard values are preserved during migration; missing seed content is merged by stable ID.
- Every mutation remains admin-authenticated and server-validated with Zod.
- Do not expose database, object-storage, or auth secrets in source or client bundles.
- Keep the existing visual branding and public information architecture unchanged.

---

### Task 1: Expand the canonical content contract and migrate the local seed

**Files:**
- Modify: `lib/content-types.ts`
- Modify: `lib/content-data.ts`
- Create: `lib/content-seed.ts`
- Modify: `lib/content-store.ts`
- Delete: `lib/content-overrides.ts`
- Create: `scripts/seed-content.ts`
- Modify: `package.json`
- Create: `tests/content-source.test.ts`

**Interfaces:**
- `SiteContent` gains `contentVersion: number` and `home: HomeContent`.
- `HomeContent` contains `about`, `video`, `gallery`, `news`, and `support` objects, each with `eyebrow`, `title`, `description`, and `ctaLabel` where applicable; `video` also has `youtubeUrl`.
- `mergeSeedContent(existing: SiteContent, seed: SiteContent): SiteContent` returns an idempotent merge that preserves non-empty existing values and appends seed records only when their IDs are absent.
- `seedCanonicalContent(): Promise<{ inserted: boolean; content: SiteContent }>` writes the singleton row and returns the stored aggregate.

- [ ] **Step 1: Add failing merge tests.**

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { defaultContent } from "../lib/content-data";
import { mergeSeedContent } from "../lib/content-seed";

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
});
```

- [ ] **Step 2: Run the focused test and verify it fails because the merge contract is missing.**

Run: `node --experimental-strip-types --test tests/content-source.test.ts`

Expected: FAIL with an import/function error for `mergeSeedContent`.

- [ ] **Step 3: Move override-only production values into `defaultContent`.**

Add the approved logo/contact values, RotiMu article, four legal documents, actual donation bank data, and the complete `home` object to `lib/content-data.ts`. Keep all existing local gallery/article IDs and add no duplicate IDs.

- [ ] **Step 4: Implement the pure merge and seed writer.**

`mergeSeedContent` must merge `settings` and `donation` field-by-field only when the existing value is empty, merge every array by stable `id`, and set `contentVersion` to the maximum of the existing and seed versions. `seedCanonicalContent` must require `DATABASE_URL`, insert `id = "singleton"` when absent, and otherwise update only the merged aggregate.

- [ ] **Step 5: Remove runtime overrides and enforce production source selection.**

`getSiteContent` must read the singleton database row when `db` exists. If `NODE_ENV === "production"` and the database or row is unavailable, throw `Error("Canonical content source is unavailable.")`; only non-production may read `data/site-content.json` or `defaultContent`. `saveSiteContent` must use the same production database requirement.

- [ ] **Step 6: Add the seed command and rerun tests.**

Add this script:

```json
"db:seed-content": "node --experimental-strip-types scripts/seed-content.ts"
```

Run: `node --experimental-strip-types --test tests/content-source.test.ts`

Expected: PASS for both idempotent merge tests.

- [ ] **Step 7: Commit the canonical contract and seed changes.**

```bash
git add lib/content-types.ts lib/content-data.ts lib/content-seed.ts lib/content-store.ts lib/content-overrides.ts scripts/seed-content.ts package.json tests/content-source.test.ts
git commit -m "feat: make database content canonical"
```

### Task 2: Move all public editorial copy to canonical content

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/berita/page.tsx`
- Modify: `app/berita/[slug]/page.tsx`
- Modify: `app/galeri/page.tsx`
- Modify: `app/kontak/page.tsx`
- Modify: `app/donasi/page.tsx`
- Modify: `app/struktur-organisasi/page.tsx`
- Modify: `app/profil/jadwal-kegiatan/page.tsx`
- Modify: `components/site/content-page.tsx`
- Modify: `app/layout.tsx`
- Modify: `lib/content-data.ts`

**Interfaces:**
- Public route pages continue to call `getSiteContent()` exactly once per request and select published records from the returned aggregate.
- Route headings and descriptions use `content.pages` records for `berita`, `galeri`, `kontak`, `struktur-organisasi`, `jadwal-kegiatan`, and `donasi`; About/SOP continue using their existing page records.
- Homepage sections use `content.home`; article cards use `content.articles`; gallery cards use `content.galleries`; documents and donation data use `content.documents` and `content.donation`.

- [ ] **Step 1: Add seed page records for every structured public route.**

Add published `PageContent` records for `berita`, `galeri`, `kontak`, `struktur-organisasi`, `jadwal-kegiatan`, and `donasi` with the current Indonesian eyebrow/title/intro copy. Keep `tentang-kami` and `sop-pengasuhan` unchanged except for their canonical seed version.

- [ ] **Step 2: Replace homepage literals with `content.home`.**

Use `content.home.about`, `content.home.video`, `content.home.gallery`, `content.home.news`, and `content.home.support` for every heading, description, CTA label, and video URL. Keep route URLs and icons as presentation code.

- [ ] **Step 3: Replace structured-page literals with published page records.**

Each structured route must find its page record by slug and render its `title`/`intro`; if missing or not published, render the existing safe empty state or call `notFound()` for detail pages. Donation heading/description remain from `content.donation`, while its legal-section title and description come from the `donasi` page record.

- [ ] **Step 4: Make root metadata use canonical settings.**

Replace static metadata in `app/layout.tsx` with an async `generateMetadata` that reads the canonical settings and returns the organization name, footer description, and Indonesian language metadata. Keep a short static fallback only for non-runtime metadata failures.

- [ ] **Step 5: Search for remaining public editorial literals.**

Run: `rg -n "RotiMu|Ikuti terus|Momen-momen|Kami siap|Struktur Pengurus|Jadwal Kegiatan|Dokumen pendukung|youtube.com/embed|Menjaga amanah" app components`

Expected: no remaining public editorial copy or homepage video URL outside `lib/content-data.ts` and dashboard forms. Navigation labels and accessibility labels may remain UI code.

- [ ] **Step 6: Commit the public read-path changes.**

```bash
git add app components/site/content-page.tsx lib/content-data.ts
git commit -m "feat: render public editorial content from database aggregate"
```

### Task 3: Make missing canonical fields editable in the dashboard

**Files:**
- Modify: `lib/validation.ts`
- Modify: `app/admin/actions.ts`
- Modify: `app/admin/home/page.tsx`
- Modify: `app/admin/settings/page.tsx`
- Modify: `app/admin/donation/page.tsx`
- Modify: `app/admin/pages/page.tsx`
- Modify: `lib/media-references.ts`
- Create or modify: `components/admin/media-reference-field.tsx` if a reusable field is needed

**Interfaces:**
- `updateSettingsAction` accepts validated logo URLs, footer description, and repeated social-link fields in addition to existing contact/WhatsApp fields.
- `saveHomeAction(formData: FormData)` validates and persists the `home` object.
- `saveDocumentAction(formData: FormData)` validates and upserts a `PublicDocument` in `content.documents`.
- All actions call `revalidatePublicContent()` after `saveSiteContent`.

- [ ] **Step 1: Add Zod schemas for home, pages, donation, documents, and remaining admin entities.**

Use URL validation for logo/social/map/media fields, bounded strings for editorial copy, enum validation for statuses/categories, and numeric bounds for ledger/order values. Preserve the existing WhatsApp number normalization rule.

- [ ] **Step 2: Add the shared revalidation helper.**

Create `lib/public-content.ts`:

```ts
import { revalidatePath } from "next/cache";

export function revalidatePublicContent() {
  revalidatePath("/", "layout");
  for (const route of ["/tentang-kami", "/struktur-organisasi", "/sop-pengasuhan", "/profil/jadwal-kegiatan", "/berita", "/galeri", "/kontak", "/donasi"]) {
    revalidatePath(route);
  }
}
```

Replace action-local revalidation calls with this helper, then add detail-page revalidation for the saved article slug where needed.

- [ ] **Step 3: Add the homepage CMS form.**

Add a canonical homepage copy form to `/admin/home` for the five `home` sections and YouTube URL, while keeping hero slide forms below it. The form submits to `saveHomeAction` and displays the current values from `getSiteContent()`.

- [ ] **Step 4: Extend settings management.**

Add logo URL, footer description, and social label/URL fields to the settings form. Persist repeated fields through `formData.getAll("socialLabel")` and `formData.getAll("socialHref")`, validate the paired array, and keep the current WhatsApp fields unchanged.

- [ ] **Step 5: Extend donation/legal management.**

Add QRIS URL to the donation form. Add a legal-document editor for title, description, document URL, category, and published status, backed by `saveDocumentAction`, so every public legal document is dashboard-managed.

- [ ] **Step 6: Add media-library references to image fields.**

Keep persisted values as canonical public URLs, add a clear “Choose from Media Library” link beside hero, article, settings-logo, gallery, and QRIS URL fields, and ensure `getImageReferences` recognizes every image-bearing canonical field before allowing deletion.

- [ ] **Step 7: Add server-side action tests.**

Cover invalid homepage URLs, invalid social URLs, invalid donation document categories, and successful canonical updates using the existing validation module without connecting to the database.

- [ ] **Step 8: Commit dashboard changes.**

```bash
git add lib/validation.ts lib/public-content.ts app/admin/actions.ts app/admin/home/page.tsx app/admin/settings/page.tsx app/admin/donation/page.tsx app/admin/pages/page.tsx lib/media-references.ts components/admin
git commit -m "feat: expose canonical content in dashboard"
```

### Task 4: Run the local-to-database migration and verify end-to-end behavior

**Files:**
- Modify: `tests/content-source.test.ts`
- Create or modify: `tests/public-content.test.ts`
- Modify: `README.md` or create `docs/content-source-runbook.md`

**Interfaces:**
- `pnpm db:seed-content` inserts the complete local canonical content into the configured PostgreSQL database and is safe to rerun.
- Public pages after migration read the same values that are visible in the dashboard.

- [ ] **Step 1: Run the migration against the configured local database.**

Run: `pnpm db:seed-content`

Expected: the command reports whether the singleton was inserted or merged, never duplicates stable IDs, and does not print credentials.

- [ ] **Step 2: Verify canonical row shape with a redacted read.**

Run a local read-only check that prints only `contentVersion`, collection counts, organization name, and public route slugs. Do not print `DATABASE_URL`, auth secrets, or object-storage credentials.

- [ ] **Step 3: Add public mapping tests.**

Assert that homepage sections use the `home` fields, gallery/news/document records come from the aggregate, and local fallback is not selected when `NODE_ENV` is production and the database row is missing.

- [ ] **Step 4: Run all verification commands.**

```bash
pnpm lint
pnpm build
node --experimental-strip-types --test tests/content-source.test.ts tests/public-content.test.ts
```

Expected: lint has no new errors, build succeeds with configured database/object storage variables, and all focused tests pass.

- [ ] **Step 5: Perform a browser smoke test.**

Log into `/admin`, edit homepage video text, one hero image URL, one news excerpt, one gallery alt text, the footer description, and QRIS URL; save each; visit `/`, `/berita`, `/galeri`, `/donasi`, and `/kontak`; confirm the updated values appear and the image URLs match the dashboard values.

- [ ] **Step 6: Commit verification/runbook updates.**

```bash
git add tests README.md docs/content-source-runbook.md
git commit -m "test: verify canonical content migration"
```

## Self-Review Checklist

- Every public route is covered by Task 2.
- Override-only content is moved in Task 1 and cannot re-enter runtime reads.
- Dashboard editing for homepage, logos, socials, footer, QRIS, and legal documents is covered in Task 3.
- Migration idempotency and production fail-closed behavior are covered by Tasks 1 and 4.
- Security, validation, media references, cache invalidation, build, lint, unit tests, and browser smoke testing are covered.
