import { ArrowRight } from "lucide-react";
import type { PageContent, SiteContent } from "@/lib/content-types";
import { PublicShell } from "./public-shell";

function RichContent({ body }: { body: string }) {
  return <div className="rich-content">{body.split(/\n\n+/).map((block, index) => { const trimmed = block.trim(); if (!trimmed) return null; if (/^(visi|misi|moto|i\.|ii\.|iii\.)/i.test(trimmed)) return <h2 key={index}>{trimmed}</h2>; if (trimmed.startsWith("-")) return <ul key={index}>{trimmed.split("\n").map((item) => <li key={item}>{item.replace(/^-\s*/, "")}</li>)}</ul>; return <p key={index}>{trimmed}</p>; })}</div>;
}

export function ContentPage({ content, page }: { content: SiteContent; page: PageContent }) {
  return <PublicShell content={content}><section className="bg-[#f8fafc] py-16 md:py-24"><div className="site-container"><span className="eyebrow">Profil Panti</span><h1 className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-tight text-ink md:text-6xl">{page.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{page.intro}</p></div></section><section className="site-container grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-24"><article className="max-w-3xl"><RichContent body={page.body} /></article><aside className="h-fit rounded-2xl border border-line bg-white p-6 shadow-subtle"><p className="text-xs font-bold uppercase tracking-wider text-orange">Navigasi</p><div className="mt-4 grid gap-3 text-sm font-semibold"><a href="#" className="text-ink hover:text-orange">Ringkasan halaman</a><a href="/struktur-organisasi" className="text-ink hover:text-orange">Struktur Pengurus</a><a href="/donasi" className="text-ink hover:text-orange">Dukung Program Kami <ArrowRight className="ml-1 inline h-3 w-3" /></a></div></aside></section></PublicShell>;
}

