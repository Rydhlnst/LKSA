# Single Canonical Content Source Design

## Objective

Make the dashboard-backed content record the single authoritative production source for every public editorial value: settings, images, homepage sections, hero slides, pages, organization, schedule, news, gallery, donation content, legal documents, and media references.

## Current Gaps

- `lib/content-store.ts` can read a local JSON/default fallback and applies `lib/content-overrides.ts` at read time.
- `content-overrides.ts` injects production-visible news, legal documents, contact data, logo data, and donation data outside the dashboard.
- Homepage video metadata and several homepage section labels/descriptions are hardcoded in `app/page.tsx`.
- Footer/social/logo fields are not completely editable from the settings screen.
- Donation QRIS and legal-document records are not fully manageable from the dashboard.
- Production can silently render fallback content when the canonical database record is absent.

## Decision

Use the `site_settings` singleton JSON row as the canonical aggregate for public content. Public routes must call `getSiteContent()` and render only the returned aggregate. Existing normalized content tables remain available for compatibility, but they are not read by public pages or admin actions in this iteration.

The database is mandatory in production. A local JSON file is retained only as a development/bootstrap fallback when the application is not running in production. A one-time migration command seeds or merges the existing default/override content into the singleton row without overwriting values already edited in the dashboard.

## Content Contract Changes

Extend `SiteContent` with an editable `home` object containing:

- about eyebrow, heading, and description
- video eyebrow, title, description, and YouTube URL
- gallery eyebrow, heading, description, and CTA label
- news eyebrow, heading, description, and CTA label
- support eyebrow, heading, description, and CTA label

Extend settings management to edit:

- primary and secondary logo URLs
- footer description
- social links
- map URL and contact details
- WhatsApp configuration

Extend donation management to edit:

- QRIS image URL
- donation copy and bank data
- confirmation number/message
- public legal-document metadata

All image fields remain URL references stored in the canonical content record. The media library remains the dashboard-controlled upload/reuse source; selecting an asset stores its public URL in the relevant content field.

## Read and Write Rules

1. `getSiteContent()` reads the singleton row directly when a database is configured.
2. In production, missing database configuration or a missing singleton row throws a safe configuration error instead of silently serving defaults.
3. Outside production, the local JSON/default content may bootstrap the application.
4. `content-overrides.ts` is removed from the runtime read path. Its existing values are moved into the migration/bootstrap seed only.
5. Every admin mutation validates input with the existing Zod schemas, writes the canonical singleton, and calls one shared public-content revalidation helper.
6. Public routes do not read raw local assets, hardcoded editorial copy, or separate content tables.

## Migration

Add a repeatable `db:seed-content` command:

- If no singleton exists, insert the complete canonical seed.
- If a singleton exists, fill only missing collections/fields and missing IDs from the canonical seed.
- Preserve existing dashboard values and existing article/gallery IDs.
- Add a content version marker so the migration is idempotent.
- Do not copy secrets or environment variables into content data.

The seed includes the current approved LKSA assets and content already present in the repository, including the RotiMu article, legal documents, actual donation bank data, and the selected LKSA logo.

## Revalidation

Create a shared helper used by all admin actions to revalidate the public route set and layout after canonical content changes. This ensures settings, news, gallery, donation, and homepage changes are visible without a manual deployment.

## Security and Validation

- Keep all writes behind the existing admin authentication/authorization guard.
- Validate URLs, slugs, statuses, image alt text, social links, donation fields, and homepage fields on the server.
- Do not expose database credentials or object-storage credentials to the client.
- Keep legal documents and donor visibility controlled by dashboard fields.
- Preserve the existing upload type/size checks and media deletion reference checks.

## Acceptance Criteria

- Every public editorial value and image is read from `getSiteContent()`.
- No public production request applies `content-overrides.ts` or silently falls back to local/default content.
- Dashboard edits to homepage copy/video, settings, logos/socials/footer, donation QRIS/legal documents, articles, galleries, hero slides, organization, and schedule appear publicly after save/publish.
- The canonical seed can run more than once without duplicating articles, documents, or gallery images.
- `pnpm lint`, `pnpm build`, and the relevant unit/browser tests pass.

## Non-Goals

- Replacing the aggregate JSON content model with fully normalized public queries.
- Adding multi-admin roles or public registration.
- Changing the existing visual brand system or public information architecture.
