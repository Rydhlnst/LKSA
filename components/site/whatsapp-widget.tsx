import { MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/content-types";

export function WhatsAppWidget({ settings }: { settings: SiteSettings }) {
  const href = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;
  return <div className="fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-3rem)] flex-col items-end">
    <div className="mb-3 hidden w-72 rounded-2xl border border-line bg-white p-4 shadow-elevated sm:block">
      <p className="text-sm font-bold text-ink">{settings.whatsappAgentName}</p>
      <p className="mt-1 text-xs text-muted">{settings.whatsappResponseTime}</p>
      <p className="mt-3 text-sm leading-6 text-ink/80">{settings.whatsappGreeting}</p>
    </div>
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-green px-4 py-3 text-sm font-bold text-white shadow-elevated transition hover:-translate-y-0.5 hover:bg-green/90"><MessageCircle className="h-5 w-5" />Chat Sekarang</a>
  </div>;
}

