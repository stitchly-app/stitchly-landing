import { motion, useInView } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode, type ElementType } from "react";

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
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const MotionTag = motion(as as any);

  return (
    <MotionTag
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0, delay }}
    >
      {children}
    </MotionTag>
  );
}

export default FadeUpSection;