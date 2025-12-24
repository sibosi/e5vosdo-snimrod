/**
 * Központi konfiguráció a média preview-k generálásához.
 * width: max szélesség pixelben (undefined = nincs korlátozás)
 * height: max magasság pixelben (undefined = nincs korlátozás)
 * quality: WebP minőség (1-100)
 * targetBytes: maximális fájlméret byte-ban
 */
export interface PreviewConfig {
  width: number | undefined;
  height: number | undefined;
  quality: number;
  targetBytes: number;
}

export type PreviewSize = "small" | "large";

/**
 * Preview méretek konfigurációja
 *
 * small: Thumbnail a galériához (gyors betöltés)
 * large: Modal/fullscreen nézet (jó minőség)
 */
export const PREVIEW_CONFIG: Record<PreviewSize, PreviewConfig> = {
  small: {
    width: undefined,
    height: 200,
    quality: 75,
    targetBytes: 15 * 1024, // Max 15KB
  },
  large: {
    width: 1920,
    height: undefined,
    quality: 85,
    targetBytes: 240 * 1024, // Max 240KB
  },
} as const;

/**
 * Preview mappa ID a Google Drive-on
 */
export const PREVIEW_FOLDER_ID = process.env.NEXT_PUBLIC_MEDIA_FOLDER_ID;

/**
 * A preview generálás minimális minőségi küszöbe
 * Ha a minőség ez alá csökken, megáll a tömörítés
 */
export const MIN_QUALITY_THRESHOLD = 30;

/**
 * Maximum tömörítési próbálkozások száma
 */
export const MAX_COMPRESSION_ATTEMPTS = 6;
