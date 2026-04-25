import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  cursor?: boolean;
  onDone?: () => void;
}

export function Typewriter({
  text,
  delay = 0,
  speed = 55,
  className,
  cursor = true,
  onDone,
}: TypewriterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (count >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(t);
  }, [started, count, text.length, speed, onDone]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {/* invisible full text reserves layout space to prevent reflow */}
      <span aria-hidden className="invisible block h-0 overflow-hidden">{text}</span>
      <span aria-hidden>{text.slice(0, count)}</span>
      {cursor && !done && (
        <span
          aria-hidden
          className="inline-block w-[0.08em] -mb-[0.05em] ml-1 align-baseline animate-pulse"
          style={{
            height: "0.9em",
            backgroundColor: "currentColor",
            verticalAlign: "-0.1em",
          }}
        />
      )}
      <span className="sr-only">{text}</span>
    </span>
  );
}

export default Typewriter;