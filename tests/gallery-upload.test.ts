import assert from "node:assert/strict";
import test from "node:test";
import { getGalleryUploadError } from "../lib/gallery-upload.ts";

test("gallery upload accepts supported images up to 5 MB", () => {
  assert.equal(getGalleryUploadError({ type: "image/jpeg", size: 5 * 1024 * 1024 }), null);
  assert.equal(getGalleryUploadError({ type: "image/png", size: 1024 }), null);
  assert.equal(getGalleryUploadError({ type: "image/webp", size: 1024 }), null);
});

test("gallery upload rejects unsupported formats and oversized files", () => {
  assert.equal(getGalleryUploadError({ type: "image/gif", size: 1024 }), "Gunakan JPG, PNG, atau WebP.");
  assert.equal(getGalleryUploadError({ type: "image/jpeg", size: 5 * 1024 * 1024 + 1 }), "Ukuran maksimal 5 MB.");
});
