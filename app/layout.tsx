import type { Metadata } from "next";
import { El_Messiri, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const elMessiri = El_Messiri({ subsets: ["latin"], variable: "--font-el-messiri" });

export const metadata: Metadata = {
  title: "LKSA Panti Asuhan Muhammadiyah Sumur Bandung",
  description: "Informasi pengasuhan, pendidikan, kegiatan anak asuh, dan dukungan untuk LKSA Panti Asuhan Muhammadiyah Sumur Bandung.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id" className={`${inter.variable} ${elMessiri.variable} h-full antialiased`}><body className="min-h-full flex flex-col">{children}<Toaster position="bottom-right" /></body></html>;
}
