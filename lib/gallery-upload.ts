export const galleryUploadAccept = "image/jpeg,image/png,image/webp";
export const galleryUploadMaxBytes = 5 * 1024 * 1024;

export function getGalleryUploadError(file: { type: string; size: number }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Gunakan JPG, PNG, atau WebP.";
  if (file.size > galleryUploadMaxBytes) return "Ukuran maksimal 5 MB.";
  return null;
}
