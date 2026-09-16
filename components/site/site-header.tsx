"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { BrandMark } from "./brand-mark";
import type { SiteSettings } from "@/lib/content-types";

const profileLinks = [
  ["Tentang Kami", "/tentang-kami"],
  ["Pengurus", "/struktur-organisasi"],
  ["SOP Pengasuhan", "/sop-pengasuhan"],
  ["Jadwal Kegiatan", "/profil/jadwal-kegiatan"],
] as const;

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 shadow-subtle backdrop-blur">
      <div className="site-container flex h-20 items-center justify-between gap-6">
        <BrandMark settings={settings} />
        <nav className="hidden items-center gap-6 desktop:flex" aria-label="Navigasi utama">
          <Link className="nav-link" href="/">Beranda</Link>
          <div className="relative" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
            <button type="button" className="nav-link inline-flex items-center gap-1" onClick={() => setProfileOpen((value) => !value)} aria-expanded={profileOpen}>
              Profil <ChevronDown className="h-4 w-4" />
            </button>
            {profileOpen && (
              <div className="absolute left-0 top-full mt-3 w-56 rounded-2xl border border-line bg-white p-2 shadow-card">
                {profileLinks.map(([label, href]) => <Link key={href} href={href} className="block rounded-xl px-3 py-2.5 text-sm text-ink transition hover:bg-orange/10 hover:text-orange">{label}</Link>)}
              </div>
            )}
          </div>
          <Link className="nav-link" href="/berita">Berita</Link>
          <Link className="nav-link" href="/galeri">Galeri</Link>
          <Link className="nav-link" href="/kontak">Kontak</Link>
          <Link className="button-primary ml-2 px-5 py-2.5 text-sm" href="/donasi">Donasi Sekarang</Link>
        </nav>
        <button type="button" className="rounded-xl p-2 text-ink transition hover:bg-orange/10 hover:text-orange desktop:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-navigation">
          <span className="sr-only">Buka menu utama</span>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && <div id="mobile-navigation" className="border-t border-line bg-white px-4 pb-6 pt-3 shadow-elevated desktop:hidden">
        <Link href="/" onClick={() => setOpen(false)} className="mobile-nav-link text-orange">Beranda</Link>
        <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Profil Panti</p>
        {profileLinks.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="mobile-nav-link">{label}</Link>)}
        <Link href="/berita" onClick={() => setOpen(false)} className="mobile-nav-link">Berita</Link>
        <Link href="/galeri" onClick={() => setOpen(false)} className="mobile-nav-link">Galeri</Link>
        <Link href="/kontak" onClick={() => setOpen(false)} className="mobile-nav-link">Kontak</Link>
        <Link href="/donasi" onClick={() => setOpen(false)} className="button-primary mt-4 flex w-full">Donasi Sekarang</Link>
      </div>}
    </header>
  );
}

