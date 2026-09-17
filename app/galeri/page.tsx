import { notFound } from "next/navigation";
import Image from "next/image";
import { Images } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";
import { PublicShell } from "@/components/site/public-shell";

export default async function GalleryPage() {
  const content = await getSiteContent();
  const page = content.pages.find((item) => item.slug === "galeri" && item.status === "published");
  if (!page) notFound();
  const images = content.galleries.filter((image) => image.visible).sort((a, b) => a.order - b.order);

  return (
    <PublicShell content={content}>
      <section className="bg-[#f8fafc] py-16 md:py-24">
        <div className="site-container">
          <span className="eyebrow">{page.eyebrow}</span>
          <h1 className="mt-5 font-heading text-4xl font-bold text-ink md:text-6xl">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{page.intro}</p>
        </div>
      </section>
      <section className="site-container py-16 md:py-24">
        {images.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <figure key={image.id} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-subtle">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f8fafc]">
                  <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <figcaption className="p-4 text-sm leading-6 text-muted">{image.caption || image.alt}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Images className="mx-auto h-8 w-8 text-orange" />
            <p className="mt-3 font-semibold text-ink">Belum ada foto galeri yang tersedia.</p>
            <p className="mt-1 text-sm text-muted">Foto yang ditambahkan dari CMS akan muncul di halaman ini.</p>
          </div>
        )}
      </section>
    </PublicShell>
  );
}
