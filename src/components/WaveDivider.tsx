interface WaveDividerProps {
  /** Color of the top half (the section above the divider) */
  topColor: string;
  /** Color of the bottom half (the section below the divider) */
  bottomColor: string;
  /** Flip the wave vertically */
  flip?: boolean;
  className?: string;
}

/**
 * Smooth SVG wave divider that blends two adjacent sections.
 * Renders a top background block and a bottom wave shape so there are no visible seams.
 */
export function WaveDivider({ topColor, bottomColor, flip = false, className }: WaveDividerProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{ backgroundColor: topColor, lineHeight: 0 }}
    >
      <svg
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block w-full h-[80px] sm:h-[120px]"
        style={{ transform: flip ? "scaleY(-1)" : undefined }}
      >
        <path
          d="M0,64 C240,112 480,16 720,48 C960,80 1200,112 1440,64 L1440,120 L0,120 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  );
}

export default WaveDivider;