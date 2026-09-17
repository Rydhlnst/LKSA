"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  alt: string;
  createdAt: string;
};

type UploadResponse = { url?: string; error?: string; asset?: MediaAsset };

function galleryHref(asset: MediaAsset) {
  const params = new URLSearchParams({ assetUrl: asset.url, assetAlt: asset.alt || asset.filename });
  return `/admin/gallery?${params.toString()}`;
}

function DeleteMediaDialog({ asset, disabled, onDelete }: { asset: MediaAsset; disabled: boolean; onDelete: () => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const deleted = await onDelete();
    setDeleting(false);
    if (deleted) setOpen(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" disabled={disabled} className="text-red-600 hover:bg-red-50 hover:text-red-700">
          <Trash2 /> Hapus
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus aset ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Aset <span className="font-semibold">{asset.filename}</span> akan dihapus dari object storage. Pastikan aset ini tidak sedang dipakai konten lain.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleting} onClick={(event) => { event.preventDefault(); void handleDelete(); }}>
            {deleting ? "Menghapus..." : "Ya, hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function MediaUploader({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadedAsset, setUploadedAsset] = useState<MediaAsset | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/upload", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await response.json() as UploadResponse;
      if (!response.ok || !data.asset) {
        const error = data.error ?? "Upload gagal.";
        setMessage(error);
        toast.error(error);
        return;
      }
      setAssets((current) => [data.asset!, ...current.filter((asset) => asset.id !== data.asset!.id)]);
      setUploadedAsset(data.asset);
      event.currentTarget.reset();
      setUploadOpen(false);
      setMessage("Aset berhasil diunggah.");
      toast.success("Aset berhasil diunggah.");
    } catch {
      const error = "Upload gagal. Periksa koneksi lalu coba lagi.";
      setMessage(error);
      toast.error(error);
    } finally {
      setBusy(false);
    }
  }

  async function removeAsset(asset: MediaAsset) {
    setBusy(true);
    try {
      const response = await fetch("/api/upload", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: asset.id, url: asset.url }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        const error = data.error ?? "Media tidak dapat dihapus.";
        setMessage(error);
        toast.error(error);
        return false;
      }
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      setUploadedAsset((current) => current?.id === asset.id ? null : current);
      setMessage("Media berhasil dihapus.");
      toast.success("Media berhasil dihapus.");
      return true;
    } catch {
      const error = "Media tidak dapat dihapus. Periksa koneksi lalu coba lagi.";
      setMessage(error);
      toast.error(error);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    if (!uploadedAsset) return;
    await navigator.clipboard.writeText(uploadedAsset.url);
    setCopied(true);
    toast.success("URL aset disalin.");
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-6 shadow-subtle md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-orange">Penyimpanan</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Aset website</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Upload gambar satu kali, lalu gunakan kembali untuk galeri, beranda, atau berita.</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={(open) => { if (!busy) setUploadOpen(open); }}>
            <DialogTrigger asChild>
              <Button type="button" className="button-primary h-11 px-5"><Upload /> Upload aset</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload aset baru</DialogTitle>
                <DialogDescription>Gunakan JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.</DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-5">
                <label className="grid gap-2 text-sm font-semibold" htmlFor="media-file">
                  Pilih gambar
                  <input id="media-file" className="rounded-xl border border-line p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange/10 file:px-3 file:py-2 file:font-semibold file:text-orange" type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
                </label>
                {message && <p className="text-sm text-red-600" role="alert">{message}</p>}
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline" disabled={busy}>Batal</Button></DialogClose>
                  <Button type="submit" className="button-primary" disabled={busy}>{busy ? "Mengunggah..." : "Upload gambar"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {message && !uploadOpen && <p className="mt-5 flex items-center gap-2 text-sm text-green" role="status"><CheckCircle2 className="h-4 w-4" />{message}</p>}
      </section>

      {uploadedAsset && (
        <section className="rounded-2xl border border-green/20 bg-green/5 p-5 shadow-subtle md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Image src={uploadedAsset.url} alt={uploadedAsset.alt || uploadedAsset.filename} width={220} height={160} className="aspect-[4/3] w-full rounded-xl object-cover sm:w-44" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-green"><CheckCircle2 className="h-4 w-4" />Aset siap digunakan</p>
                  <p className="mt-1 truncate text-sm font-semibold text-ink">{uploadedAsset.filename}</p>
                </div>
                <button type="button" aria-label="Tutup pratinjau aset" onClick={() => setUploadedAsset(null)} className="rounded-full p-1 text-muted hover:bg-white hover:text-ink"><X className="h-4 w-4" /></button>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">Hubungkan sekarang agar foto ini tampil di galeri publik.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link href={galleryHref(uploadedAsset)} className="button-primary">Tambahkan ke galeri <ArrowRight className="ml-2 h-4 w-4" /></Link>
                <button type="button" onClick={copyUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-orange"><Copy className="h-4 w-4" />{copied ? "Tersalin" : "Salin URL"}</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-white p-6 shadow-subtle md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold">Aset tersimpan</h2>
            <p className="mt-1 text-sm text-muted">Hapus hanya aset yang tidak lagi digunakan oleh konten.</p>
          </div>
          <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-muted">{assets.length} aset</span>
        </div>
        {assets.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-xl border border-line">
                <Image src={asset.url} alt={asset.alt || asset.filename} width={640} height={480} className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{asset.filename}</p>
                    <p className="mt-1 text-xs text-muted">{asset.mimeType}</p>
                  </div>
                  <DeleteMediaDialog asset={asset} disabled={busy} onDelete={() => removeAsset(asset)} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-[#f8fafc] p-8 text-center">
            <Upload className="mx-auto h-7 w-7 text-orange" />
            <p className="mt-3 font-semibold text-ink">Belum ada aset tersimpan</p>
            <p className="mt-1 text-sm text-muted">Upload gambar pertama untuk mulai mengisi media library.</p>
          </div>
        )}
      </section>
    </div>
  );
}
