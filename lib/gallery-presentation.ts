import type { GalleryItem } from "./content-types";

export function getGalleryPreview(items: GalleryItem[], limit = 6) {
  return items
    .filter((item) => item.visible)
    .sort((a, b) => b.order - a.order)
    .slice(0, limit);
}
