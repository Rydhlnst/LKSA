"use client";

import { deleteGalleryImageAction } from "@/app/admin/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteGalleryForm({ id, label }: { id: string; label: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">Hapus</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus foto dari galeri?</AlertDialogTitle>
          <AlertDialogDescription>Foto <span className="font-semibold">{label}</span> akan dilepas dari galeri publik. Aset fisik hanya dihapus jika tidak dipakai konten lain.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <form action={deleteGalleryImageAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction asChild variant="destructive"><button type="submit">Ya, hapus</button></AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
