import type { ReactNode } from "react";
import type { SiteContent } from "@/lib/content-types";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { WhatsAppWidget } from "./whatsapp-widget";

export function PublicShell({ content, children }: { content: SiteContent; children: ReactNode }) {
  return <><SiteHeader settings={content.settings} /><main className="flex-1">{children}</main><SiteFooter settings={content.settings} /><WhatsAppWidget settings={content.settings} /></>;
}

