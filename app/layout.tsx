import type { Metadata } from "next";
import { El_Messiri, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getSiteContent } from "@/lib/content-store";
import { buildSiteMetadata, resolveSiteBaseUrl } from "@/lib/site-metadata";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const elMessiri = El_Messiri({ subsets: ["latin"], variable: "--font-el-messiri" });

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return buildSiteMetadata({
    organizationName: content.settings.organizationName,
    description: content.settings.footerDescription,
    baseUrl: resolveSiteBaseUrl(process.env.NEXT_PUBLIC_BASE_URL),
  });
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id" className={`${inter.variable} ${elMessiri.variable} h-full antialiased`}><body className="min-h-full flex flex-col">{children}<Toaster position="bottom-right" /></body></html>;
}
