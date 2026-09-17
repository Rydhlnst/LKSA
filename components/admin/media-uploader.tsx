"use client";

import Image from "next/image";
import { useState } from "react";

type MediaAsset = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  alt: string;
  createdAt: string;
};

type UploadResponse = { url?: string; error?: string; asset?: MediaAsset };

export function MediaUploader({ initialAssets }: { initialAssets: MediaAsset[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("Mengunggah...");
    try {
      const form = event.currentTarget;
      const response = await fetch("/api/upload", { method: "POST", body: new FormData(form) });
      const data = await response.json() as UploadResponse;
      if (!response.ok) {
        setMessage(data.error ?? "Upload gagal.");
        return;
      }
      setUrl(data.url ?? "");
      if (data.asset) setAssets((current) => [data.asset!, ...current]);
      form.reset();
      setMessage("Upload berhasil. Preview dan aset tersimpan di bawah.");
    } catch {
      setMessage("Upload gagal. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAsset(asset: MediaAsset) {
    if (!window.confirm("Hapus \"" + asset.filename + "\" dari penyimpanan?")) return;
    setBusy(true);
    setMessage("Menghapus...");
    try {
      const response = await fetch("/api/upload", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: asset.id, url: asset.url }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) {
        setMessage(data.error ?? "Media tidak dapat dihapus.");
        return;
      }
      setAssets((current) => current.filter((item) => item.id !== asset.id));
      if (url === asset.url) setUrl("");
      setMessage("Media berhasil dihapus.");
    } catch {
      setMessage("Media tidak dapat dihapus. Periksa koneksi lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-6 shadow-subtle">
        <label className="grid gap-2 text-sm font-semibold">
          Pilih gambar
          <input className="mt-2 rounded-xl border border-line p-3 text-sm" type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        <button className="button-primary mt-6 disabled:cursor-not-allowed disabled:opacity-60" disabled={busy}>{busy ? "Memproses..." : "Upload"}</button>
        {message && <p className="mt-4 text-sm text-muted" role="status">{message}</p>}
        {url && (
          <div className="mt-5 grid gap-3 rounded-xl border border-line bg-[#f8fafc] p-4 sm:grid-cols-[160px_1fr]">
            <Image src={url} alt="Preview aset yang baru diunggah" width={640} height={480} className="aspect-[4/3] h-full w-full rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Preview upload</p>
              <p className="mt-2 break-all text-xs text-muted">{url}</p>
              <p className="mt-3 text-xs text-muted">Salin URL ini ke form Galeri, Beranda, atau Berita jika gambar ingin ditampilkan di website publik.</p>
            </div>
          </div>
        )}
      </form>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-subtle">
        <div>
          <h2 className="font-heading text-xl font-bold">Aset tersimpan</h2>
          <p className="mt-1 text-sm text-muted">Hapus hanya aset yang tidak lagi digunakan oleh konten.</p>
        </div>
        {assets.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-xl border border-line">
                <Image src={asset.url} alt={asset.alt || asset.filename} width={640} height={480} className="aspect-[4/3] w-full object-cover" />
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{asset.filename}</p>
                    <p className="mt-1 text-xs text-muted">{asset.mimeType}</p>
                  </div>
                  <button type="button" onClick={() => removeAsset(asset)} disabled={busy} className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50">Hapus</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-xl bg-[#f8fafc] p-4 text-sm text-muted">Belum ada aset yang diindeks. Upload pertama akan muncul di sini.</p>
        )}
      </section>
    </div>
  );
}
