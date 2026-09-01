"use client";

import imageCompression from "browser-image-compression";

export interface PreparedImage {
  file: File;
  previewUrl: string;
  originalName: string;
}

/**
 * Compresse et convertit une image en WebP côté navigateur avant l'upload.
 * - redimensionne à 2000px max sur le grand côté
 * - vise ~0.9 Mo
 */
export async function prepareImage(input: File): Promise<PreparedImage> {
  const isImage = input.type.startsWith("image/");
  if (!isImage) {
    throw new Error(`"${input.name}" n'est pas une image.`);
  }

  const compressed = await imageCompression(input, {
    maxSizeMB: 0.9,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.82,
  });

  const baseName = input.name.replace(/\.[^./\\]+$/, "");
  const file = new File([compressed], `${baseName}.webp`, { type: "image/webp" });

  return {
    file,
    previewUrl: URL.createObjectURL(file),
    originalName: input.name,
  };
}

/** Nom de fichier storage unique et propre. */
export function buildStoragePath(folder: string, index: number): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const stamp = Date.now().toString(36);
  const n = String(index).padStart(2, "0");
  return `${folder}/${n}-${stamp}${rand}.webp`;
}
