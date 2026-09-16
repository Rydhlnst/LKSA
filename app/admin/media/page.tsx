import { requireAdmin } from "@/lib/auth";
import { AdminHeader, AdminShell } from "@/components/admin/admin-shell";
import { MediaUploader } from "@/components/admin/media-uploader";

export default async function MediaAdminPage() { await requireAdmin(); return <AdminShell><AdminHeader eyebrow="Media library" title="Upload aset website" description="Upload gambar yang sudah mendapat izin penggunaan. File disimpan lokal untuk development." /><div className="max-w-4xl p-5 md:p-10"><MediaUploader /></div></AdminShell>; }
