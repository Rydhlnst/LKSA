"use client";

import { deleteGalleryImageAction } from "@/app/admin/actions";

export function DeleteGalleryForm({ id, label }: { id: string; label: string }) {
  return (
    <form action={deleteGalleryImageAction} onSubmit={(event) => {
      if (!window.confirm("Hapus \"" + label + "\" dari galeri?")) event.preventDefault();
    }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm font-semibold text-red-600 hover:text-red-700">Hapus</button>
    </form>
  );
}
