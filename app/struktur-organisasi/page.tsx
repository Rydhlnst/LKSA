import { notFound } from "next/navigation";
import { getSiteContent } from "@/lib/content-store";
import { PublicShell } from "@/components/site/public-shell";
import { SectionHeading } from "@/components/site/section-heading";

export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const content = await getSiteContent();
  const page = content.pages.find((item) => item.slug === "struktur-organisasi" && item.status === "published");
  if (!page) notFound();
  const organigram = page.sections?.organigram;
  if (!organigram) notFound();
  const nodes = content.organization.filter((node) => node.active).sort((a, b) => a.order - b.order);

  return <PublicShell content={content}><section className="bg-[#f8fafc] py-16 md:py-24"><div className="site-container"><span className="eyebrow">{page.eyebrow}</span><h1 className="mt-5 font-heading text-4xl font-bold text-ink md:text-6xl">{page.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{page.intro}</p></div></section><section className="site-container py-16 md:py-24"><SectionHeading eyebrow={organigram.eyebrow} title={organigram.title} description={organigram.description} /><div className="mt-12 grid gap-5 md:grid-cols-2">{nodes.map((node) => <article key={node.id} className={`rounded-2xl border border-line bg-white p-6 shadow-subtle ${node.parentId ? "md:ml-8" : "border-l-4 border-l-orange"}`}><p className="text-xs font-bold uppercase tracking-wider text-orange">{node.role}</p><h2 className="mt-2 font-heading text-xl font-bold text-ink">{node.name}</h2></article>)}</div></section></PublicShell>;
}
