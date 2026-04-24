interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}

interface Dimensions {
  width: number;
  height: number;
}

/**
 * Get target dimensions based on aspect ratio and resolution
 */
export function getTargetDimensions(
  aspectRatio: FormatSettings["aspectRatio"],
  resolution: FormatSettings["resolution"]
): Dimensions {
  const resolutionMap: Record<string, number> = {
    "480p": 480,
    "720p": 720,
    "1080p": 1080,
    "1440p": 1440,
    "4k": 2160
  };

  const height = resolutionMap[resolution];

  let width: number;
  let finalHeight: number;

  switch (aspectRatio) {
    case "16:9":
      width = Math.round((height * 16) / 9);
      // Round to nearest multiple of 16 for H.264 compatibility
      width = Math.round(width / 16) * 16;
      finalHeight = height;
      break;
    case "9:16":
      finalHeight = Math.round((height * 16) / 9);
      // Round to nearest multiple of 16 for H.264 compatibility
      finalHeight = Math.round(finalHeight / 16) * 16;
      width = height;
      break;
    case "1:1":
      width = height;
      finalHeight = height;
      break;
  }

  return {
    width,
    height: finalHeight
  };
}

/**
 * Generate FFmpeg filter string for format conversion
 */
export function getFFmpegFilterString(
  formatSettings: FormatSettings
): string {
  const { width, height } = getTargetDimensions(
    formatSettings.aspectRatio,
    formatSettings.resolution
  );

  if (formatSettings.cropMode === "fit") {
    // Fit mode: scale to fit within bounds and add padding (letterbox/pillarbox)
    return `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`;
  } else {
    // Fill mode: scale to fill and crop excess
    return `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
  }
}

/**
 * Format resolution string for display
 */
export function formatResolutionString(formatSettings: FormatSettings): string {
  const { width, height } = getTargetDimensions(
    formatSettings.aspectRatio,
    formatSettings.resolution
  );
  return `${width}x${height}`;
}
