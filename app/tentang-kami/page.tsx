import { notFound } from "next/navigation";
import { ContentPage } from "@/components/site/content-page";
import { getSiteContent } from "@/lib/content-store";

export default async function AboutPage() { const content = await getSiteContent(); const page = content.pages.find((item) => item.slug === "tentang-kami" && item.status === "published"); if (!page) notFound(); return <ContentPage content={content} page={page} />; }
