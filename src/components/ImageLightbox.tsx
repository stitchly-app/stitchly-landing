import { useEffect } from "react";
import { X } from "lucide-react";

interface ImageLightboxProps {
  open: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export function ImageLightbox({ open, onClose, src, alt = "" }: ImageLightboxProps) {
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
        className="relative max-w-[95vw] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-[95vw] max-h-[92vh] w-auto h-auto rounded-lg shadow-2xl block"
        />
      </div>
    </div>
  );
}

export default ImageLightbox;