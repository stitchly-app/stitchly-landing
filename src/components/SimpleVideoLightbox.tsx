import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface SimpleVideoLightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
}

/**
 * Lightbox for short autoplay/loop/muted videos.
 * No controls / no playhead. Clicking the video toggles pause/play.
 * Click outside or X to close. Esc closes.
 */
export function SimpleVideoLightbox({ open, onClose, src }: SimpleVideoLightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

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
    if (!open) return;
    setPaused(false);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  }, [open, src]);

  if (!open) return null;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white transition-colors p-2 z-10"
      >
        <X className="h-7 w-7" />
      </button>
      <div
        className="w-full max-w-[1200px] aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={src}
          autoPlay
          loop
          muted
          playsInline
          onClick={togglePlay}
          aria-label={paused ? "Play video" : "Pause video"}
          className="w-full h-full rounded-lg shadow-2xl bg-black cursor-pointer"
        />
      </div>
    </div>
  );
}

export default SimpleVideoLightbox;