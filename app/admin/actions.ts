"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, credentialsMatch, destroyAdminSession, requireAdmin } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/content-store";
import { articleSchema, loginSchema, settingsSchema } from "@/lib/validation";

const value = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const booleanValue = (formData: FormData, key: string) => formData.get(key) === "on" || formData.get(key) === "true";
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}`;

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({ email: value(formData, "email"), password: value(formData, "password") });
  if (!parsed.success || !credentialsMatch(parsed.data.email, parsed.data.password)) redirect("/admin/login?error=1");
  await createAdminSession(parsed.data.email);
  redirect("/admin");
}

export async function logoutAction() { await destroyAdminSession(); redirect("/admin/login"); }

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const parsed = settingsSchema.safeParse({ organizationName: value(formData, "organizationName"), shortName: value(formData, "shortName"), address: value(formData, "address"), phone: value(formData, "phone"), email: value(formData, "email"), mapUrl: value(formData, "mapUrl"), whatsappNumber: value(formData, "whatsappNumber"), whatsappAgentName: value(formData, "whatsappAgentName"), whatsappResponseTime: value(formData, "whatsappResponseTime"), whatsappGreeting: value(formData, "whatsappGreeting"), whatsappMessage: value(formData, "whatsappMessage") });
  if (!parsed.success) redirect("/admin/settings?error=validation");
  content.settings = { ...content.settings, ...parsed.data };
  await saveSiteContent(content);
  revalidatePath("/", "layout");
  redirect("/admin/settings?saved=1");
}

export async function savePageAction(formData: FormData) {
  await requireAdmin();
  const content = await getSiteContent();
  const id = value(formData, "id") || nextId("page");
  const page = { id, slug: value(formData, "slug"), title: value(formData, "title"), intro: value(formData, "intro"), body: value(formData, "body"), status: value(formData, "status") as "draft" | "published" | "archived", updatedAt: new Date().toISOString().slice(0, 10) };
  const existing = content.pages.findIndex((item) => item.id === id);
  if (existing >= 0) content.pages[existing] = page; else content.pages.push(page);
  await saveSiteContent(content); revalidatePath(`/${page.slug}`); redirect("/admin/pages?saved=1");
}

export async function saveHeroAction(formData: FormData) {
  await requireAdmin(); const content = await getSiteContent(); const id = value(formData, "id") || nextId("hero"); const slide = { id, title: value(formData, "title"), description: value(formData, "description"), imageUrl: value(formData, "imageUrl"), ctaLabel: value(formData, "ctaLabel"), ctaHref: value(formData, "ctaHref"), order: Number(value(formData, "order")) || 1, active: booleanValue(formData, "active") }; const index = content.heroSlides.findIndex((item) => item.id === id); if (index >= 0) content.heroSlides[index] = slide; else content.heroSlides.push(slide); await saveSiteContent(content); revalidatePath("/"); redirect("/admin/home?saved=1");
}

export async function saveArticleAction(formData: FormData) {
  await requireAdmin(); const content = await getSiteContent(); const raw = { id: value(formData, "id") || undefined, title: value(formData, "title"), slug: value(formData, "slug"), excerpt: value(formData, "excerpt"), body: value(formData, "body"), publishDate: value(formData, "publishDate"), status: value(formData, "status"), featured: booleanValue(formData, "featured") }; const parsed = articleSchema.safeParse(raw); if (!parsed.success) redirect("/admin/news?error=validation"); const id = parsed.data.id || nextId("article"); const article = { ...parsed.data, id, coverUrl: value(formData, "coverUrl") || content.articles.find((item) => item.id === id)?.coverUrl || "", updatedAt: new Date().toISOString().slice(0, 10) }; const index = content.articles.findIndex((item) => item.id === id); if (index >= 0) content.articles[index] = article; else content.articles.push(article); await saveSiteContent(content); revalidatePath("/berita"); revalidatePath(`/berita/${article.slug}`); redirect("/admin/news?saved=1");
}

export async function saveOrganizationAction(formData: FormData) { await requireAdmin(); const content = await getSiteContent(); const id = value(formData, "id") || nextId("org"); const node = { id, name: value(formData, "name"), role: value(formData, "role"), parentId: value(formData, "parentId") || null, order: Number(value(formData, "order")) || 1, active: booleanValue(formData, "active") }; const index = content.organization.findIndex((item) => item.id === id); if (index >= 0) content.organization[index] = node; else content.organization.push(node); await saveSiteContent(content); revalidatePath("/struktur-organisasi"); redirect("/admin/organization?saved=1"); }

export async function saveScheduleAction(formData: FormData) { await requireAdmin(); const content = await getSiteContent(); const id = value(formData, "id") || nextId("schedule"); const entry = { id, group: (value(formData, "group") || "weekday") as "weekday" | "weekend", period: (value(formData, "period") || "pagi") as "pagi" | "siang" | "sore" | "malam", time: value(formData, "time"), activity: value(formData, "activity"), location: value(formData, "location"), coordinator: value(formData, "coordinator"), order: Number(value(formData, "order")) || 1, active: booleanValue(formData, "active") }; const index = content.schedule.findIndex((item) => item.id === id); if (index >= 0) content.schedule[index] = entry; else content.schedule.push(entry); await saveSiteContent(content); revalidatePath("/profil/jadwal-kegiatan"); redirect("/admin/schedule?saved=1"); }

export async function saveDonationAction(formData: FormData) { await requireAdmin(); const content = await getSiteContent(); content.donation = { ...content.donation, heading: value(formData, "heading"), description: value(formData, "description"), bankName: value(formData, "bankName"), accountNumber: value(formData, "accountNumber"), accountHolder: value(formData, "accountHolder"), confirmationMessage: value(formData, "confirmationMessage"), confirmationWhatsapp: value(formData, "confirmationWhatsapp"), transparencyHeading: value(formData, "transparencyHeading") }; await saveSiteContent(content); revalidatePath("/donasi"); redirect("/admin/donation?saved=1"); }

export async function saveLedgerAction(formData: FormData) { await requireAdmin(); const content = await getSiteContent(); const entry = { id: nextId("ledger"), type: (value(formData, "type") || "income") as "income" | "expense", description: value(formData, "description"), amount: Number(value(formData, "amount")) || 0, date: value(formData, "date"), status: (value(formData, "status") || "completed") as "planned" | "completed", public: booleanValue(formData, "public") }; content.ledger.push(entry); await saveSiteContent(content); revalidatePath("/donasi"); redirect("/admin/donation?saved=1"); }

