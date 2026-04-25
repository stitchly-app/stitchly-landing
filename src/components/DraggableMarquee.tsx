import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DraggableMarqueeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a single Marquee child and lets the user click-drag (or swipe)
 * to pan the strip horizontally. The outer div stays put (it's the
 * clipping viewport) and we translate the inner marquee track instead.
 * The CSS marquee animation keeps running underneath.
 */
export function DraggableMarquee({ children, className }: DraggableMarqueeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const stateRef = useRef({ dragging: false, startX: 0, startOffset: 0, moved: false });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = stateRef.current;
      if (!s.dragging) return;
      const dx = e.clientX - s.startX;
      if (Math.abs(dx) > 3) s.moved = true;
      setOffset(s.startOffset + dx);
    };
    const onUp = () => {
      stateRef.current.dragging = false;
      if (wrapperRef.current) wrapperRef.current.style.cursor = "grab";
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
      moved: false,
    };
    if (wrapperRef.current) wrapperRef.current.style.cursor = "grabbing";
  };

  // Inject our drag offset into the single Marquee child via inline style.
  const child = Children.only(children) as ReactElement<{ style?: React.CSSProperties }>;
  const dragged = isValidElement(child)
    ? cloneElement(child, {
        style: {
          ...(child.props.style || {}),
          transform: `translateX(${offset}px)`,
        },
      })
    : child;

  return (
    <div
      ref={wrapperRef}
      onPointerDown={onPointerDown}
      className={cn("relative overflow-hidden select-none touch-pan-y", className)}
      style={{ cursor: "grab" }}
    >
      {dragged}
    </div>
  );
}

export default DraggableMarquee;