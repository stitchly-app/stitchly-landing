import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}

type ExportSpeed = "quality" | "fast";

interface UseVideoEditorReturn {
  trimVideo: (
    videoFile: File, 
    startTime: number, 
    endTime: number, 
    formatSettings?: FormatSettings,
    exportSpeed?: ExportSpeed
  ) => Promise<Blob>;
  generateThumbnails: (videoFile: File, numberOfFrames?: number) => Promise<string[]>;
  concatenateVideos: (videoBlobs: Blob[]) => Promise<Blob>;
  loadFFmpeg: () => Promise<boolean>;
  isLoading: boolean;
  progress: number;
  isFFmpegLoaded: boolean;
  error: string | null;
}

const CDN_URLS = [
  {
    core: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    wasm: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  },
  {
    core: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    wasm: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
  },
];

export const useVideoEditor = (): UseVideoEditorReturn => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFFmpeg = useCallback(async () => {
    // Check if FFmpeg is already loaded properly
    if (ffmpegRef.current && ffmpegRef.current.loaded) {
      console.log('[FFmpeg] Already loaded, skipping initialization');
      return true;
    }

    console.log('[FFmpeg] Starting initialization...');
    const ffmpeg = new FFmpeg();
    
    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]:', message);
    });

    ffmpeg.on('progress', ({ progress: p }) => {
      console.log('[FFmpeg] Progress:', p);
      setProgress(Math.round(p * 100));
    });

    // Try loading from different CDNs with timeout
    for (const cdn of CDN_URLS) {
      try {
        console.log(`[FFmpeg] Attempting to load from ${cdn.core}`);
        
        // Add timeout wrapper
        const loadWithTimeout = Promise.race([
          (async () => {
            const coreURL = await toBlobURL(cdn.core, 'text/javascript');
            const wasmURL = await toBlobURL(cdn.wasm, 'application/wasm');
            console.log('[FFmpeg] Blob URLs created, loading FFmpeg...');
            await ffmpeg.load({ coreURL, wasmURL });
            console.log('[FFmpeg] Load completed, checking loaded flag...');
            return ffmpeg.loaded;
          })(),
          new Promise<boolean>((_, reject) => 
            setTimeout(() => reject(new Error('FFmpeg load timeout after 30s')), 30000)
          )
        ]);

        const isLoaded = await loadWithTimeout;
        
        // Verify FFmpeg is actually loaded
        if (!isLoaded) {
          console.warn('[FFmpeg] Load completed but loaded flag is false');
          continue;
        }
        
        ffmpegRef.current = ffmpeg;
        setIsFFmpegLoaded(true);
        console.log('[FFmpeg] Successfully loaded and ready from', cdn.core);
        return true;
      } catch (err) {
        console.error(`[FFmpeg] Failed to load from ${cdn.core}:`, err);
        continue;
      }
    }

    const error = 'Failed to load FFmpeg from all CDN sources';
    console.error('[FFmpeg]', error);
    setError(error);
    throw new Error(error);
  }, []);

  const trimVideo = useCallback(async (
    videoFile: File,
    startTime: number,
    endTime: number,
    formatSettings?: FormatSettings,
    exportSpeed: ExportSpeed = "quality"
  ): Promise<Blob> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Verify FFmpeg is loaded
      if (!ffmpegRef.current || !ffmpegRef.current.loaded) {
        throw new Error('FFmpeg not loaded. Call loadFFmpeg() first.');
      }
      
      const ffmpeg = ffmpegRef.current;
      
      if (formatSettings) {
        console.log(`[FFmpeg] Trimming and converting video from ${startTime}s to ${endTime}s with format:`, formatSettings);
      } else {
        console.log(`[FFmpeg] Trimming video from ${startTime}s to ${endTime}s`);
      }

      // Write input file to FFmpeg virtual filesystem
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      // Calculate duration
      const duration = endTime - startTime;

      // Build FFmpeg command based on format settings
      const ffmpegArgs: string[] = [
        '-i', inputName,
        '-ss', startTime.toString(),
        '-t', duration.toString()
      ];

      if (formatSettings) {
        // Apply format conversion with encoding
        const { getFFmpegFilterString } = await import('@/lib/videoFormatUtils');
        const filterString = getFFmpegFilterString(formatSettings);
        
        // Use device-compatible presets for better compatibility
        const preset = exportSpeed === "fast" ? "fast" : "medium";
        const crf = exportSpeed === "fast" ? "23" : "20";
        
        console.log(`[FFmpeg] Using ${exportSpeed} export mode: preset=${preset}, crf=${crf}`);
        
        ffmpegArgs.push(
          '-vf', filterString,
          '-c:v', 'libx264',
          '-preset', preset,
          '-crf', crf,
          '-pix_fmt', 'yuv420p',
          '-profile:v', 'baseline',
          '-level', '3.0',
          '-movflags', '+faststart',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-ac', '2',
          '-ar', '44100',  // Changed from 48000 for better device compatibility
          '-max_muxing_queue_size', '1024',  // Prevent audio/video sync issues
          '-vsync', 'cfr'  // Constant frame rate for better compatibility
        );
      } else {
        // No format changes needed - use stream copy for instant processing
        console.log('[FFmpeg] No format changes detected, using fast stream copy');
        ffmpegArgs.push('-c', 'copy');
      }

      ffmpegArgs.push(outputName);

      // Execute FFmpeg command
      await ffmpeg.exec(ffmpegArgs);

      // Read the output file
      const data = await ffmpeg.readFile(outputName);
      // Convert to regular Uint8Array to avoid SharedArrayBuffer issues
      const uint8Array = new Uint8Array(data instanceof Uint8Array ? data : []);
      const blob = new Blob([uint8Array], { type: 'video/mp4' });

      // Cleanup
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      setIsLoading(false);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[FFmpeg] Trim error:', err);
      setError(`Failed to trim video: ${errorMessage}`);
      setIsLoading(false);
      throw err;
    }
  }, []);

  const generateThumbnails = useCallback(async (
    videoFile: File,
    numberOfFrames: number = 10
  ): Promise<string[]> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      await loadFFmpeg();
      const ffmpeg = ffmpegRef.current!;

      const inputName = 'input.mp4';
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

      // Get video duration first
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(videoFile);
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = resolve;
      });
      const duration = videoElement.duration;
      URL.revokeObjectURL(videoElement.src);

      const thumbnails: string[] = [];
      const interval = duration / (numberOfFrames + 1);

      for (let i = 1; i <= numberOfFrames; i++) {
        const timestamp = interval * i;
        const outputName = `thumb${i}.jpg`;

        await ffmpeg.exec([
          '-ss', timestamp.toString(),
          '-i', inputName,
          '-frames:v', '1',
          '-q:v', '2',
          outputName
        ]);

        const data = await ffmpeg.readFile(outputName);
        // Convert to regular Uint8Array to avoid SharedArrayBuffer issues
        const uint8Array = new Uint8Array(data instanceof Uint8Array ? data : []);
        const blob = new Blob([uint8Array], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        thumbnails.push(url);

        await ffmpeg.deleteFile(outputName);
        setProgress(Math.round((i / numberOfFrames) * 100));
      }

      await ffmpeg.deleteFile(inputName);
      setIsLoading(false);
      return thumbnails;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to generate thumbnails: ${errorMessage}`);
      setIsLoading(false);
      throw err;
    }
  }, [loadFFmpeg]);

  const concatenateVideos = useCallback(async (videoBlobs: Blob[]): Promise<Blob> => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Verify FFmpeg is loaded
      if (!ffmpegRef.current || !ffmpegRef.current.loaded) {
        throw new Error('FFmpeg not loaded. Call loadFFmpeg() first.');
      }
      
      const ffmpeg = ffmpegRef.current;
      
      console.log(`[FFmpeg] Concatenating ${videoBlobs.length} videos`);

      // Write all video blobs to FFmpeg filesystem
      const inputFiles: string[] = [];
      for (let i = 0; i < videoBlobs.length; i++) {
        const inputName = `input${i}.mp4`;
        await ffmpeg.writeFile(inputName, await fetchFile(videoBlobs[i]));
        inputFiles.push(inputName);
      }

      // Create concat file
      const concatContent = inputFiles.map(f => `file '${f}'`).join('\n');
      await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      const outputName = 'output.mp4';

      // Execute FFmpeg concat command
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        outputName
      ]);

      // Read the output file
      const data = await ffmpeg.readFile(outputName);
      const uint8Array = new Uint8Array(data instanceof Uint8Array ? data : []);
      const blob = new Blob([uint8Array], { type: 'video/mp4' });

      // Cleanup
      for (const inputFile of inputFiles) {
        await ffmpeg.deleteFile(inputFile);
      }
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile(outputName);

      setIsLoading(false);
      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('[FFmpeg] Concatenate error:', err);
      setError(`Failed to concatenate videos: ${errorMessage}`);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    trimVideo,
    generateThumbnails,
    concatenateVideos,
    loadFFmpeg,
    isLoading,
    progress,
    isFFmpegLoaded,
    error,
  };
};

export const concatenateVideos = async (videoBlobs: Blob[]): Promise<Blob> => {
  const ffmpeg = new FFmpeg();
  
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg Concat]:', message);
  });

  // Load FFmpeg
  const coreURL = await toBlobURL(
    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
    'text/javascript'
  );
  const wasmURL = await toBlobURL(
    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
    'application/wasm'
  );
  await ffmpeg.load({ coreURL, wasmURL });

  // Write all video blobs to FFmpeg filesystem
  const inputFiles: string[] = [];
  for (let i = 0; i < videoBlobs.length; i++) {
    const inputName = `input${i}.mp4`;
    await ffmpeg.writeFile(inputName, await fetchFile(videoBlobs[i]));
    inputFiles.push(inputName);
  }

  // Create concat file
  const concatContent = inputFiles.map(f => `file '${f}'`).join('\n');
  await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

  const outputName = 'output.mp4';

  // Execute FFmpeg concat command
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-c', 'copy',
    outputName
  ]);

  // Read the output file
  const data = await ffmpeg.readFile(outputName);
  const uint8Array = new Uint8Array(data instanceof Uint8Array ? data : []);
  const blob = new Blob([uint8Array], { type: 'video/mp4' });

  // Cleanup
  for (const inputFile of inputFiles) {
    await ffmpeg.deleteFile(inputFile);
  }
  await ffmpeg.deleteFile('concat.txt');
  await ffmpeg.deleteFile(outputName);

  return blob;
};
