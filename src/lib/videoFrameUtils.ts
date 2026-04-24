/**
 * Utility functions for extracting video frames
 */

/**
 * Extract video frames at evenly-spaced intervals
 * @param video - HTMLVideoElement to extract frames from
 * @param frameCount - Number of frames to extract (default: 10)
 * @returns Promise that resolves to array of frame data URLs
 */
export const extractVideoFrames = async (
  video: HTMLVideoElement,
  frameCount: number = 10
): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const frames: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Wait for video metadata to be loaded
    const onMetadataLoaded = async () => {
      try {
        const duration = video.duration;
        
        // Set canvas size to small thumbnail size for performance
        canvas.width = 120;
        canvas.height = 68;

        // Calculate time intervals for frame extraction
        const interval = duration / (frameCount - 1);
        const originalTime = video.currentTime;
        
        // Extract frames sequentially
        for (let i = 0; i < frameCount; i++) {
          const timestamp = i * interval;
          
          // Seek to timestamp
          video.currentTime = timestamp;
          
          // Wait for seek to complete
          await new Promise<void>((seekResolve) => {
            const onSeeked = () => {
              // Draw current frame to canvas
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convert canvas to data URL
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              frames.push(dataUrl);
              
              video.removeEventListener('seeked', onSeeked);
              seekResolve();
            };
            
            video.addEventListener('seeked', onSeeked);
          });
        }
        
        // Restore original video position
        video.currentTime = originalTime;
        
        resolve(frames);
      } catch (error) {
        reject(error);
      }
    };

    if (video.readyState >= 2) {
      // Metadata already loaded
      onMetadataLoaded();
    } else {
      // Wait for metadata to load
      video.addEventListener('loadedmetadata', onMetadataLoaded, { once: true });
    }
  });
};
