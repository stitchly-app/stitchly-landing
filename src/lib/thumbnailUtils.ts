/**
 * Generate a thumbnail from a video file
 * @param videoFile The video file to generate thumbnail from
 * @param seekTime Time in seconds to capture the thumbnail (default: 1 second)
 * @returns A promise that resolves to a Blob containing the thumbnail image
 */
export const generateVideoThumbnail = async (
  videoFile: File,
  seekTime: number = 1
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const videoURL = URL.createObjectURL(videoFile);
    video.src = videoURL;

    const cleanup = () => {
      URL.revokeObjectURL(videoURL);
      video.remove();
    };

    video.onloadedmetadata = () => {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to the specified time (or start if video is shorter)
      const targetTime = Math.min(seekTime, Math.max(0, video.duration - 0.1));
      video.currentTime = targetTime;
    };

    video.onseeked = () => {
      try {
        // Draw the current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create thumbnail blob'));
            }
          },
          'image/jpeg',
          0.85
        );
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    video.onerror = (error) => {
      cleanup();
      reject(new Error('Failed to load video for thumbnail generation'));
    };

    // Timeout fallback
    setTimeout(() => {
      cleanup();
      reject(new Error('Thumbnail generation timeout'));
    }, 10000);
  });
};
