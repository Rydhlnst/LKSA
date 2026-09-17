import Image from "next/image";
import Link from "next/link";
import { saveGalleryAction } from "@/app/admin/actions";
import { AdminHeader, AdminShell } from "@/components/admin/admin-shell";
import { DeleteGalleryForm } from "@/components/admin/delete-gallery-form";
import { requireAdmin } from "@/lib/auth";
import { getSiteContent } from "@/lib/content-store";

const input = "mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20";

export default async function GalleryAdminPage({ searchParams }: PageProps<"/admin/gallery">) {
  await requireAdmin();
  const params = await searchParams;
  const initialUrl = typeof params.assetUrl === "string" ? params.assetUrl : "";
  const initialAlt = typeof params.assetAlt === "string" ? params.assetAlt : "";
  const { galleries } = await getSiteContent();
  const images = [...galleries].sort((a, b) => a.order - b.order);

  return (
    <AdminShell>
      <AdminHeader eyebrow="Media" title="Galeri foto" description="Kelola koleksi foto publik sebagai satu galeri tanpa pengelompokan album kegiatan." />
      <div className="max-w-6xl space-y-6 p-5 md:p-10">
        <Link href="/admin/media" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-orange">← Kembali ke Media Library</Link>
        <form action={saveGalleryAction} className="grid gap-5 rounded-2xl border-2 border-dashed border-line bg-white p-6 shadow-subtle md:grid-cols-2">
          <div className="md:col-span-2">
            <h2 className="font-heading text-xl font-bold">Tambahkan foto ke galeri</h2>
            <p className="mt-1 text-sm text-muted">{initialUrl ? "Aset baru sudah dipilih dari Media Library. Lengkapi detailnya lalu simpan." : "Tempel URL dari Media Library setelah upload berhasil."}</p>
          </div>
          <label className="text-sm font-semibold md:col-span-2">URL gambar<input className={input} name="url" defaultValue={initialUrl} placeholder="https://media.example.com/uploads/foto.jpg" required /></label>
          <label className="text-sm font-semibold">Teks alternatif<input className={input} name="alt" defaultValue={initialAlt} placeholder="Anak asuh mengikuti kegiatan..." required /></label>
          <label className="text-sm font-semibold">Urutan<input className={input} name="order" type="number" min={1} defaultValue={images.length + 1} required /></label>
          <label className="text-sm font-semibold md:col-span-2">Keterangan<input className={input} name="caption" placeholder="Kegiatan pembinaan bersama anak asuh." /></label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="visible" defaultChecked /> Tampilkan di website</label>
          <button type="submit" className="button-primary w-fit">Simpan ke galeri</button>
        </form>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-subtle">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-xl font-bold">Foto terhubung</h2>
              <p className="mt-1 text-sm text-muted">{images.filter((image) => image.visible).length} foto tampil di galeri publik, {images.length} foto tersimpan.</p>
            </div>
            <Link href="/admin/media" className="button-primary">Buka Media Library</Link>
          </div>
          {images.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((image) => (
                <figure key={image.id} className="overflow-hidden rounded-xl border border-line">
                  <div className="relative aspect-[4/3] bg-[#f8fafc]">
                    <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <figcaption className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{image.caption || image.alt}</p>
                      <p className="mt-1 text-xs text-muted">{image.visible ? "Publik" : "Draft"} · urutan {image.order}</p>
                    </div>
                    <DeleteGalleryForm id={image.id} label={image.caption || image.alt} />
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="empty-state mt-6">
              <p className="font-semibold text-ink">Belum ada foto.</p>
              <p className="mt-1 text-sm text-muted">Upload aset melalui Media Library, lalu tambahkan URL-nya di sini.</p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
