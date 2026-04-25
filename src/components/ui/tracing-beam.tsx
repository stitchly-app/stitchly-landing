import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

interface TracingBeamProps {
  children: ReactNode;
  className?: string;
}

export function TracingBeam({ children, className }: TracingBeamProps) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 60%", "end 40%"],
  });

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setSvgHeight(contentRef.current.offsetHeight);
    });
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), {
    stiffness: 500,
    damping: 90,
  });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]), {
    stiffness: 500,
    damping: 90,
  });

  return (
    <motion.div ref={ref} className={cn("relative w-full", className)}>
      <div className="absolute -left-4 md:-left-8 top-3">
        <motion.div
          transition={{ duration: 0.2, delay: 0.5 }}
          animate={{ boxShadow: scrollYProgress.get() > 0 ? "none" : "rgba(124, 58, 237, 0.5) 0px 0px 12px" }}
          className="ml-[27px] flex h-4 w-4 items-center justify-center rounded-full border border-primary/40 shadow-sm"
        >
          <motion.div
            transition={{ duration: 0.2, delay: 0.5 }}
            animate={{ backgroundColor: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" }}
            className="h-2 w-2 rounded-full border border-primary bg-primary"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden
        >
          <motion.path
            d={`M 1 0 V -36 l 18 24 V ${svgHeight * 0.8} l -18 24 V ${svgHeight}`}
            fill="none"
            stroke="hsl(var(--border))"
            strokeOpacity="0.6"
            transition={{ duration: 10 }}
          />
          <motion.path
            d={`M 1 0 V -36 l 18 24 V ${svgHeight * 0.8} l -18 24 V ${svgHeight}`}
            fill="none"
            stroke="url(#tracing-gradient)"
            strokeWidth="1.5"
            className="motion-reduce:hidden"
          />
          <defs>
            <motion.linearGradient
              id="tracing-gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#3B82F6" stopOpacity="0" />
              <stop stopColor="#3B82F6" />
              <stop offset="0.325" stopColor="#7C3AED" />
              <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  );
}

export default TracingBeam;