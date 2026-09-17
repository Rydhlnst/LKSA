import { revalidatePath } from "next/cache";

export function revalidatePublicContent() {
  revalidatePath("/", "layout");
  for (const route of [
    "/tentang-kami",
    "/struktur-organisasi",
    "/sop-pengasuhan",
    "/profil/jadwal-kegiatan",
    "/berita",
    "/galeri",
    "/kontak",
    "/donasi",
  ]) revalidatePath(route);
}
