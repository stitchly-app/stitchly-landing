import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScreenshotRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** If true, animates on mount instead of on scroll (for hero) */
  immediate?: boolean;
  duration?: number;
  yOffset?: number;
}

export function ScreenshotReveal({
  children,
  className,
  delay = 0,
  immediate = false,
  duration = 0.8,
  yOffset = 40,
}: ScreenshotRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!immediate) return;
    // Wait long enough for parent fade-ins to complete, then start a slow reveal.
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, [immediate]);
  const visible = immediate ? mounted : inView;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, scale: 0.96 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: yOffset, scale: 0.96 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn("screenshot-glow screenshot-hover", visible && "is-visible", className)}
    >
      {children}
    </motion.div>
  );
}

export default ScreenshotReveal;