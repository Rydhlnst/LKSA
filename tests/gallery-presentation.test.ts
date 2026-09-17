import assert from "node:assert/strict";
import test from "node:test";
import { getGalleryPreview } from "../lib/gallery-presentation.ts";

test("homepage gallery preview uses visible items in order and respects its limit", () => {
  const result = getGalleryPreview([
    { id: "hidden", url: "/hidden.jpg", alt: "Hidden", caption: "", order: 1, visible: false },
    { id: "late", url: "/late.jpg", alt: "Late", caption: "", order: 9, visible: true },
    { id: "first", url: "/first.jpg", alt: "First", caption: "", order: 2, visible: true },
  ], 1);

  assert.deepEqual(result.map((item) => item.id), ["first"]);
});
