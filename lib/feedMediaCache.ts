import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), ".feed-cache");

export function ensureFeedCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

export function getFeedCachePath(driveId: string, checksum?: string | null) {
  const suffix = checksum ? `${driveId}-${checksum}` : driveId;
  return path.join(CACHE_DIR, suffix);
}

export function getCachedFeedMediaPath(
  driveId: string,
  checksum?: string | null,
) {
  ensureFeedCacheDir();
  const cachePath = getFeedCachePath(driveId, checksum);
  return fs.existsSync(cachePath) ? cachePath : null;
}

export function writeFeedCacheFile(cachePath: string, buffer: Buffer) {
  ensureFeedCacheDir();
  fs.writeFileSync(cachePath, buffer);
}
