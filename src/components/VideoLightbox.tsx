import { useEffect } from "react";
import { X } from "lucide-react";

interface VideoLightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
}

export function VideoLightbox({ open, onClose }: VideoLightboxProps) {
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
        className="w-full max-w-[1200px]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/Stitchly - VSL Promo Coming Soon.jpg"
          alt="Stitchly VSL Promo Coming Soon"
          className="w-full h-auto rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
}

export default VideoLightbox;