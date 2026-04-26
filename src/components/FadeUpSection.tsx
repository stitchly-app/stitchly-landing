import { motion, useInView } from "framer-motion";
import { useMemo, useRef, type CSSProperties, type ReactNode, type ElementType } from "react";
import { cn } from "@/lib/utils";

interface FadeUpSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  as?: ElementType;
  style?: CSSProperties;
}

export function FadeUpSection({
  children,
  className,
  id,
  delay = 0,
  as = "section",
  style,
}: FadeUpSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const MotionTag = useMemo(() => motion(as as any), [as]);

  return (
    <MotionTag
      ref={ref}
      id={id}
      className={cn("fade-section", className)}
      style={style}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}

export default FadeUpSection;