import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DraggableMarqueeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a Marquee so the user can click-and-drag (or touch-swipe) to
 * pan the strip horizontally. The underlying CSS marquee animation keeps
 * running; the drag offset is applied as an additional translateX on the
 * wrapper.
 */
export function DraggableMarquee({ children, className }: DraggableMarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const stateRef = useRef({ dragging: false, startX: 0, startOffset: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      setOffset(s.startOffset + (e.clientX - s.startX));
    };
    const onUp = () => {
      stateRef.current.dragging = false;
      if (ref.current) ref.current.style.cursor = "grab";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    stateRef.current = {
      dragging: true,
      startX: e.clientX,
      startOffset: offset,
    };
    if (ref.current) ref.current.style.cursor = "grabbing";
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className={cn("select-none touch-pan-y", className)}
      style={{
        cursor: "grab",
        transform: `translateX(${offset}px)`,
      }}
    >
      {children}
    </div>
  );
}

export default DraggableMarquee;