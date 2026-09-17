import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";
import { AdminHeader, AdminShell } from "@/components/admin/admin-shell";

export default async function GalleryAdminPage() {
  await requireAdmin();
  const { galleries } = await getSiteContent();
  const images = galleries.filter((image) => image.visible).sort((a, b) => a.order - b.order);

  return (
    <AdminShell>
      <AdminHeader eyebrow="Media" title="Galeri foto" description="Kelola koleksi foto publik sebagai satu galeri tanpa pengelompokan album kegiatan." />
      <div className="max-w-6xl p-5 md:p-10">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-subtle">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold">Foto tersedia</h2>
              <p className="mt-1 text-sm text-muted">{images.length} foto tampil di galeri publik.</p>
            </div>
            <a href="/admin/media" className="button-primary">Buka Media Library</a>
          </div>
          {images.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <figure key={image.id} className="overflow-hidden rounded-xl border border-line">
                  <div className="relative aspect-[4/3] bg-[#f8fafc]">
                    <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <figcaption className="p-4">
                    <p className="text-sm font-semibold text-ink">{image.caption || image.alt}</p>
                    <p className="mt-1 text-xs text-muted">{image.visible ? "Publik" : "Draft"}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-6">
              <p className="font-semibold text-ink">Belum ada foto.</p>
              <p className="mt-1 text-sm text-muted">Tambahkan aset melalui media library untuk mengisi galeri.</p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}