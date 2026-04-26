import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 80,
  duration = 8,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffffff",
  colorTo = "#E0D4FF",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[filter:drop-shadow(0_0_8px_var(--color-from))_drop-shadow(0_0_16px_var(--color-from))] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        "before:absolute before:h-[14px] before:w-[14px] before:rounded-full before:animate-border-beam before:[animation-delay:var(--delay)] before:[background:#ffffff] before:[box-shadow:0_0_10px_3px_#ffffff,0_0_20px_8px_var(--color-from),0_0_40px_16px_var(--color-from),0_0_70px_28px_var(--color-from)] before:[offset-anchor:50%_50%] before:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className,
      )}
    />
  );
}

export default BorderBeam;