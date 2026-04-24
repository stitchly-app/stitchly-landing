import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Hls from "hls.js";

interface VideoLightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
}

export function VideoLightbox({ open, onClose, src }: VideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !videoRef.current) return;
    const video = videoRef.current;
    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }
    video.play().catch(() => {});
    return () => {
      hls?.destroy();
      video.pause();
    };
  }, [open, src]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white transition-colors p-2"
      >
        <X className="h-7 w-7" />
      </button>
      <div
        className="w-full max-w-[1200px] aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          className="w-full h-full rounded-lg shadow-2xl bg-black"
          controls
          playsInline
        />
      </div>
    </div>
  );
}

export default VideoLightbox;