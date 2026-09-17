import type { SiteContent } from "./content-types";

export function getImageReferences(content: SiteContent, url: string, excludedGalleryId?: string) {
  const references: string[] = [];
  if (content.settings.logoPrimary === url) references.push("logo utama");
  if (content.settings.logoSecondary === url) references.push("logo sekunder");
  if (content.donation.qrisUrl === url) references.push("QRIS donasi");
  if (content.heroSlides.some((slide) => slide.imageUrl === url)) references.push("slide hero");
  if (content.articles.some((article) => article.coverUrl === url)) references.push("cover berita");
  if (content.galleries.some((image) => image.id !== excludedGalleryId && image.url === url)) references.push("galeri");
  return references;
}
