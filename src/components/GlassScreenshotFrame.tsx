import { type ReactNode } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

interface GlassScreenshotFrameProps {
  children: ReactNode;
  className?: string;
  /** Border beam animation duration in seconds */
  beamDuration?: number;
  /** Delay before the beam starts (offsets multiple frames) */
  beamDelay?: number;
  /** Show the mac-style traffic light dots header */
  showMacHeader?: boolean;
}

/**
 * Premium glass-style screenshot container matching the hero treatment:
 *  - Soft purple→blue radial glow behind the card
 *  - Translucent dark glass with backdrop blur and inner highlights
 *  - Static directional light gradients + slow drifting ambient light
 *  - Edge highlights (left bright / right + bottom dark)
 *  - Slow clockwise traveling purple BorderBeam with glowing head dot
 *  - Optional Mac-style window header
 */
export function GlassScreenshotFrame({
  children,
  className,
  beamDuration = 30,
  beamDelay = 0,
  showMacHeader = true,
}: GlassScreenshotFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Soft purple-to-blue radial glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 rounded-[2.5rem] animate-hero-glow"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(124,58,237,0.38) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(59,130,246,0.32) 0%, transparent 65%)",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <div
        className="no-shimmer relative z-10 rounded-2xl overflow-hidden p-3 sm:p-4"
        style={{
          background: "rgba(8, 10, 20, 0.62)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:
            "0 30px 80px -20px rgba(0,0,0,0.6), 0 10px 40px -10px rgba(124,58,237,0.25), inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.35)",
        }}
      >
        {/* Static light gradients */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 12% 8%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(ellipse 70% 60% at 90% 95%, rgba(0,0,0,0.35) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)",
            zIndex: 1,
          }}
        />
        {/* Slow drifting ambient light */}
        <div aria-hidden className="glass-drift rounded-2xl" style={{ zIndex: 1 }} />
        {/* Slow clockwise traveling purple glow border */}
        <BorderBeam
          size={320}
          duration={beamDuration}
          delay={beamDelay}
          borderWidth={2}
          colorFrom="#A855F7"
          colorTo="rgba(168,85,247,0)"
          className="rounded-2xl"
        />
        {/* Edge highlights */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            zIndex: 2,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            zIndex: 2,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 50%, transparent 100%)",
            zIndex: 2,
          }}
        />
        {/* Mac-style header */}
        {showMacHeader && (
          <div className="relative flex items-center gap-1.5 px-2 pb-3" style={{ zIndex: 3 }}>
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "rgba(255,95,86,0.55)" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "rgba(255,189,46,0.55)" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "rgba(39,201,63,0.55)" }} />
          </div>
        )}
        {/* Top-edge glass highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
            zIndex: 3,
          }}
        />
        <div className="relative w-full" style={{ zIndex: 2 }}>
          <div
            className="relative w-full rounded-xl overflow-hidden"
            style={{ boxShadow: "0 10px 30px -10px rgba(0,0,0,0.55)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlassScreenshotFrame;