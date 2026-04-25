import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenshotRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** If true, animates on mount instead of on scroll (for hero) */
  immediate?: boolean;
}

export function ScreenshotReveal({
  children,
  className,
  delay = 0,
  immediate = false,
}: ScreenshotRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!immediate) return;
    // Force a microtask + paint before flipping state so the initial
    // (hidden) styles are committed first, guaranteeing the transition runs.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => cancelAnimationFrame(id);
  }, [immediate]);
  const visible = immediate ? mounted : inView;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.96 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn("screenshot-glow screenshot-hover", visible && "is-visible", className)}
    >
      {children}
    </motion.div>
  );
}

export default ScreenshotReveal;