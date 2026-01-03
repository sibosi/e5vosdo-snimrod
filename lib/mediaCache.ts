import fs from "fs";
import path from "path";

// Cache könyvtár a projekt gyökerében
const CACHE_DIR = path.join(process.cwd(), ".media-cache");
const SMALL_PREVIEW_DIR = path.join(CACHE_DIR, "small");
const LARGE_PREVIEW_DIR = path.join(CACHE_DIR, "large");

// Könyvtárak létrehozása induláskor
export function ensureCacheDirs() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  if (!fs.existsSync(SMALL_PREVIEW_DIR)) {
    fs.mkdirSync(SMALL_PREVIEW_DIR, { recursive: true });
  }
  if (!fs.existsSync(LARGE_PREVIEW_DIR)) {
    fs.mkdirSync(LARGE_PREVIEW_DIR, { recursive: true });
  }
}

export type PreviewSize = "small" | "large";

/**
 * Visszaadja a cache fájl útvonalát az image ID és méret alapján.
 */
export function getCachePath(imageId: number, size: PreviewSize): string {
  const dir = size === "small" ? SMALL_PREVIEW_DIR : LARGE_PREVIEW_DIR;
  return path.join(dir, `${imageId}.webp`);
}

/**
 * Ellenőrzi, hogy létezik-e a cache fájl.
 */
export function isCached(imageId: number, size: PreviewSize): boolean {
  const cachePath = getCachePath(imageId, size);
  return fs.existsSync(cachePath);
}

/**
 * Beolvassa a cache fájlt Buffer-ként.
 */
export function readCachedFile(
  imageId: number,
  size: PreviewSize,
): Buffer | null {
  const cachePath = getCachePath(imageId, size);
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath);
  }
  return null;
}

/**
 * Elmenti a képet a cache-be.
 */
export function writeCacheFile(
  imageId: number,
  size: PreviewSize,
  buffer: Buffer,
): void {
  ensureCacheDirs();
  const cachePath = getCachePath(imageId, size);
  fs.writeFileSync(cachePath, buffer);
}

/**
 * Törli a cache fájlt (ha újra kell generálni).
 */
export function deleteCacheFile(imageId: number, size: PreviewSize): void {
  const cachePath = getCachePath(imageId, size);
  if (fs.existsSync(cachePath)) {
    fs.unlinkSync(cachePath);
  }
}

/**
 * Törli az összes cache fájlt egy képhez.
 */
export function deleteAllCacheForImage(imageId: number): void {
  deleteCacheFile(imageId, "small");
  deleteCacheFile(imageId, "large");
}

/**
 * Visszaadja a cache könyvtár statisztikáit.
 */
export function getCacheStats(): {
  smallCount: number;
  largeCount: number;
  totalSizeBytes: number;
} {
  ensureCacheDirs();

  const countFiles = (dir: string) => {
    try {
      return fs.readdirSync(dir).filter((f) => f.endsWith(".webp")).length;
    } catch {
      return 0;
    }
  };

  const getDirSize = (dir: string): number => {
    try {
      return fs.readdirSync(dir).reduce((acc, file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        return acc + (stat.isFile() ? stat.size : 0);
      }, 0);
    } catch {
      return 0;
    }
  };

  return {
    smallCount: countFiles(SMALL_PREVIEW_DIR),
    largeCount: countFiles(LARGE_PREVIEW_DIR),
    totalSizeBytes:
      getDirSize(SMALL_PREVIEW_DIR) + getDirSize(LARGE_PREVIEW_DIR),
  };
}
