"use client";

import { useEffect, useId, useState } from "react";
import {
  ArrowUpRight,
  Globe2,
  MapPin,
  MessageCircle,
  Music2,
  X,
} from "lucide-react";
import type { SiteSettings } from "@/lib/content-types";

function SocialIcon({ label }: { label: string }) {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("facebook")) return <Globe2 className="h-4 w-4 text-blue-600" />;
  if (normalizedLabel.includes("instagram")) return <Globe2 className="h-4 w-4 text-pink-500" />;
  if (normalizedLabel.includes("tiktok")) return <Music2 className="h-4 w-4 text-ink" />;
  if (normalizedLabel.includes("youtube")) return <Globe2 className="h-4 w-4 text-red-500" />;
  if (normalizedLabel.includes("map")) return <MapPin className="h-4 w-4 text-orange" />;
  return <Globe2 className="h-4 w-4 text-muted" />;
}

export function WhatsAppWidget({ settings }: { settings: SiteSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const whatsappHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  const socialLinks = settings.socialLinks.filter((social) => social.href);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Kontak dan kanal resmi LKSA"
          className="mb-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-white shadow-elevated"
        >
          <div className="bg-navy p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">Hubungi kami</p>
            <p className="mt-2 font-heading text-xl font-bold">Mari terhubung dengan LKSA</p>
            <p className="mt-2 text-sm leading-6 text-white/70">{settings.whatsappGreeting}</p>
          </div>

          <div className="space-y-3 p-4">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-green/20 bg-green/10 p-3 transition hover:-translate-y-0.5 hover:border-green/40 hover:bg-green/15"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green text-white">
                <MessageCircle className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-ink">WhatsApp</span>
                <span className="mt-0.5 block text-xs text-muted">{settings.whatsappAgentName} · {settings.whatsappResponseTime}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-green" />
            </a>

            {socialLinks.length ? (
              <div className="border-t border-line pt-3">
                <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Kanal dan lokasi</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {socialLinks.map((social) => (
                    <a
                      key={`${social.label}-${social.href}`}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-orange/40 hover:bg-orange/5"
                    >
                      <SocialIcon label={social.label} />
                      <span className="min-w-0 flex-1 truncate">{social.label}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? "Tutup kanal kontak" : "Buka kanal kontak"}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full bg-green px-4 py-3 text-sm font-bold text-white shadow-elevated transition hover:-translate-y-0.5 hover:bg-green/90"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden sm:inline">{isOpen ? "Tutup" : "Chat WhatsApp"}</span>
      </button>
    </div>
  );
}

