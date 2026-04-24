import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode, type ElementType } from "react";

interface FadeUpSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  as?: ElementType;
}

export function FadeUpSection({
  children,
  className,
  id,
  delay = 0,
  as = "section",
}: FadeUpSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const MotionTag = motion(as as any);

  return (
    <MotionTag
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </MotionTag>
  );
}

export default FadeUpSection;