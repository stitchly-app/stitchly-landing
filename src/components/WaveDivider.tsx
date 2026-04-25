interface WaveDividerProps {
  bottomColor: string;
  flip?: boolean;
  className?: string;
}
export function WaveDivider({ bottomColor, flip = false, className }: WaveDividerProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        position: "relative",
        zIndex: 10,
        lineHeight: 0,
        height: 120,
        marginTop: -120,
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="120"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block"
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