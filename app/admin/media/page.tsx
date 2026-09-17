import { requireAdmin } from "@/lib/auth";
import { AdminHeader, AdminShell } from "@/components/admin/admin-shell";
import { MediaUploader } from "@/components/admin/media-uploader";
import { getMediaAssets } from "@/lib/media-store";

export default async function MediaAdminPage() {
  await requireAdmin();
  const assets = await getMediaAssets();
  return (
    <AdminShell>
      <AdminHeader eyebrow="Media library" title="Upload aset website" description="Upload gambar yang sudah mendapat izin penggunaan. File disimpan di object storage yang dikonfigurasi." />
      <div className="max-w-5xl p-5 md:p-10">
        <MediaUploader initialAssets={assets.map((asset) => ({ ...asset, createdAt: asset.createdAt.toISOString() }))} />
      </div>
    </AdminShell>
  );
}
