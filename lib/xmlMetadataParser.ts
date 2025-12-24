export interface FaceRegion {
  name?: string;
  type: string;
  rotation: number;
  area: {
    x: number; // Center X (0-1 normalized)
    y: number; // Center Y (0-1 normalized)
    w: number; // Width (0-1 normalized)
    h: number; // Height (0-1 normalized)
  };
}

export interface ParsedXMLMetadata {
  fileName: string;
  dateTimeOriginal?: string;
  subjects: string[]; // dc:subject tags
  faceRegions: FaceRegion[];
  imageDimensions?: {
    width: number;
    height: number;
  };
}

export interface TagImportPreview {
  tagName: string;
  isPersonTag: boolean;
  coordinates?: {
    // Pixel coordinates (calculated from normalized values and image dimensions)
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface XMLImportPreview {
  xmlFileName: string;
  matchedImageId: number | null;
  matchedImageName: string | null;
  tags: TagImportPreview[];
  dateTimeOriginal?: string;
  warnings: string[];
}

function extractMatch(
  content: string,
  pattern: RegExp,
): RegExpExecArray | null {
  return pattern.exec(content);
}

function extractSubjects(xmlContent: string): string[] {
  const subjectPattern =
    /<dc:subject>[\s\S]*?<rdf:Bag>([\s\S]*?)<\/rdf:Bag>[\s\S]*?<\/dc:subject>/;
  const subjectMatches = extractMatch(xmlContent, subjectPattern);

  if (!subjectMatches) return [];

  const liPattern = /<rdf:li>(.*?)<\/rdf:li>/g;
  const subjects: string[] = [];
  let liMatch: RegExpExecArray | null;

  while ((liMatch = liPattern.exec(subjectMatches[1])) !== null) {
    subjects.push(liMatch[1].trim());
  }

  return subjects;
}

function extractDimensions(
  xmlContent: string,
): { width: number; height: number } | undefined {
  // Try mwg-rs:AppliedToDimensions first
  const dimPattern =
    /<mwg-rs:AppliedToDimensions[\s\S]*?stDim:w="(\d+)"[\s\S]*?stDim:h="(\d+)"/;
  const dimMatch = extractMatch(xmlContent, dimPattern);

  if (dimMatch) {
    return {
      width: Number.parseInt(dimMatch[1], 10),
      height: Number.parseInt(dimMatch[2], 10),
    };
  }

  const tiffWidthPattern = /tiff:ImageWidth="(\d+)"/;
  const tiffHeightPattern = /tiff:ImageLength="(\d+)"/;
  const tiffWidth = extractMatch(xmlContent, tiffWidthPattern);
  const tiffHeight = extractMatch(xmlContent, tiffHeightPattern);

  if (tiffWidth && tiffHeight) {
    return {
      width: Number.parseInt(tiffWidth[1], 10),
      height: Number.parseInt(tiffHeight[1], 10),
    };
  }

  return undefined;
}

function parseFaceRegion(regionXml: string): FaceRegion | null {
  if (!regionXml.includes("mwg-rs:Type")) return null;

  const faceRegion: FaceRegion = {
    type: "",
    rotation: 0,
    area: { x: 0, y: 0, w: 0, h: 0 },
  };

  // Extract name
  const nameMatch = extractMatch(regionXml, /mwg-rs:Name="([^"]+)"/);
  if (nameMatch) {
    faceRegion.name = nameMatch[1];
  }

  // Extract type
  const typeMatch = extractMatch(regionXml, /mwg-rs:Type="([^"]+)"/);
  if (typeMatch) {
    faceRegion.type = typeMatch[1];
  }

  // Extract rotation
  const rotationMatch = extractMatch(regionXml, /mwg-rs:Rotation="([^"]+)"/);
  if (rotationMatch) {
    faceRegion.rotation = Number.parseFloat(rotationMatch[1]);
  }

  // Extract area coordinates
  const xMatch = extractMatch(regionXml, /stArea:x="([^"]+)"/);
  const yMatch = extractMatch(regionXml, /stArea:y="([^"]+)"/);
  const wMatch = extractMatch(regionXml, /stArea:w="([^"]+)"/);
  const hMatch = extractMatch(regionXml, /stArea:h="([^"]+)"/);

  if (xMatch && yMatch && wMatch && hMatch) {
    faceRegion.area = {
      x: Number.parseFloat(xMatch[1]),
      y: Number.parseFloat(yMatch[1]),
      w: Number.parseFloat(wMatch[1]),
      h: Number.parseFloat(hMatch[1]),
    };
  }

  return faceRegion.type ? faceRegion : null;
}

function extractFaceRegions(xmlContent: string): FaceRegion[] {
  const regionListPattern =
    /<mwg-rs:RegionList>[\s\S]*?<rdf:Bag>([\s\S]*?)<\/rdf:Bag>[\s\S]*?<\/mwg-rs:RegionList>/;
  const regionListMatch = extractMatch(xmlContent, regionListPattern);

  if (!regionListMatch) return [];

  const regions = regionListMatch[1].split(/<rdf:li>/);
  const faceRegions: FaceRegion[] = [];

  for (const region of regions) {
    const parsed = parseFaceRegion(region);
    if (parsed) {
      faceRegions.push(parsed);
    }
  }

  return faceRegions;
}

export function parseXMPMetadata(
  xmlContent: string,
  fileName: string,
): ParsedXMLMetadata {
  const result: ParsedXMLMetadata = {
    fileName,
    subjects: [],
    faceRegions: [],
  };

  try {
    result.subjects = extractSubjects(xmlContent);

    const dateMatch = extractMatch(
      xmlContent,
      /exif:DateTimeOriginal="([^"]+)"/,
    );
    if (dateMatch) {
      result.dateTimeOriginal = dateMatch[1];
    }

    result.imageDimensions = extractDimensions(xmlContent);

    result.faceRegions = extractFaceRegions(xmlContent);
  } catch (error) {
    console.error("Error parsing XMP metadata:", error);
  }

  return result;
}

export function normalizedToPixelCoords(
  area: FaceRegion["area"],
  imageWidth: number,
  imageHeight: number,
): { x1: number; y1: number; x2: number; y2: number } {
  // Area is defined as center point (x, y) and dimensions (w, h)
  // All values are normalized (0-1)
  const centerX = area.x * imageWidth;
  const centerY = area.y * imageHeight;
  const halfWidth = (area.w * imageWidth) / 2;
  const halfHeight = (area.h * imageHeight) / 2;

  return {
    x1: Math.round(centerX - halfWidth),
    y1: Math.round(centerY - halfHeight),
    x2: Math.round(centerX + halfWidth),
    y2: Math.round(centerY + halfHeight),
  };
}

export function generateImportPreview(
  metadata: ParsedXMLMetadata,
  matchedImageId: number | null,
  matchedImageName: string | null,
): XMLImportPreview {
  const preview: XMLImportPreview = {
    xmlFileName: metadata.fileName,
    matchedImageId,
    matchedImageName,
    tags: [],
    dateTimeOriginal: metadata.dateTimeOriginal,
    warnings: [],
  };

  if (!matchedImageId) {
    preview.warnings.push(`No matching image found for "${metadata.fileName}"`);
  }

  // Add subject tags (non-person tags from dc:subject)
  const personNames = new Set(
    metadata.faceRegions.filter((r) => r.name).map((r) => r.name!),
  );

  for (const subject of metadata.subjects) {
    // Check if this subject is also a named face region
    const isPersonTag = personNames.has(subject);

    if (!isPersonTag) {
      // Regular tag (no coordinates)
      preview.tags.push({
        tagName: subject,
        isPersonTag: false,
      });
    }
  }

  // Add face region tags with coordinates
  for (const region of metadata.faceRegions) {
    if (region.name && region.type === "Face") {
      const tagPreview: TagImportPreview = {
        tagName: region.name,
        isPersonTag: true,
      };

      if (metadata.imageDimensions) {
        tagPreview.coordinates = normalizedToPixelCoords(
          region.area,
          metadata.imageDimensions.width,
          metadata.imageDimensions.height,
        );
      } else {
        preview.warnings.push(
          `No image dimensions found, coordinates for "${region.name}" will be normalized (0-1)`,
        );
        // Store normalized coordinates as-is (will need image dimensions later)
        tagPreview.coordinates = {
          x1: Math.round(region.area.x * 10000),
          y1: Math.round(region.area.y * 10000),
          x2: Math.round((region.area.x + region.area.w) * 10000),
          y2: Math.round((region.area.y + region.area.h) * 10000),
        };
      }

      preview.tags.push(tagPreview);
    }
  }

  // Add unnamed faces as warnings
  const unnamedFaces = metadata.faceRegions.filter(
    (r) => !r.name && r.type === "Face",
  );
  if (unnamedFaces.length > 0) {
    preview.warnings.push(
      `${unnamedFaces.length} unnamed face(s) detected and will be skipped`,
    );
  }

  return preview;
}
