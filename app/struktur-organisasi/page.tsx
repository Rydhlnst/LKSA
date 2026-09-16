import { getSiteContent } from "@/lib/content-store";
import { PublicShell } from "@/components/site/public-shell";
import { SectionHeading } from "@/components/site/section-heading";

export default async function OrganizationPage() {
  const content = await getSiteContent();
  const nodes = content.organization.filter((node) => node.active).sort((a, b) => a.order - b.order);

  return <PublicShell content={content}><section className="bg-[#f8fafc] py-16 md:py-24"><div className="site-container"><span className="eyebrow">Profil Panti</span><h1 className="mt-5 font-heading text-4xl font-bold text-ink md:text-6xl">Struktur Pengurus & Pengelola</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">Struktur pengelolaan LKSA Panti Asuhan Muhammadiyah Sumur Bandung. Nama dan jabatan dapat diperbarui melalui dashboard CMS.</p></div></section><section className="site-container py-16 md:py-24"><SectionHeading eyebrow="Organigram" title="Bersama menjalankan amanah pengasuhan" description="Pengurus, pengasuh, pendamping pendidikan, dan relawan bekerja bersama untuk menjaga layanan anak asuh." /><div className="mt-12 grid gap-5 md:grid-cols-2">{nodes.map((node) => <article key={node.id} className={`rounded-2xl border border-line bg-white p-6 shadow-subtle ${node.parentId ? "md:ml-8" : "border-l-4 border-l-orange"}`}><p className="text-xs font-bold uppercase tracking-wider text-orange">{node.role}</p><h2 className="mt-2 font-heading text-xl font-bold text-ink">{node.name}</h2></article>)}</div></section></PublicShell>;
}
