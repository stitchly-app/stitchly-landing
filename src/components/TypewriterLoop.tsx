import { useEffect, useState } from "react";

interface TypewriterLoopProps {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  holdMs?: number;
  className?: string;
  startDelay?: number;
  style?: React.CSSProperties;
}

/**
 * Loops through `words`: types each letter, holds, then deletes letter-by-letter.
 * Reserves layout width using the longest word (invisible) to avoid reflow.
 */
export function TypewriterLoop({
  words,
  typeSpeed = 90,
  deleteSpeed = 55,
  holdMs = 1400,
  className,
  startDelay = 0,
  style,
}: TypewriterLoopProps) {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"idle" | "typing" | "holding" | "deleting">("idle");

  useEffect(() => {
    const t = setTimeout(() => setPhase("typing"), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    const word = words[index];
    if (phase === "typing") {
      if (count < word.length) {
        const t = setTimeout(() => setCount((c) => c + 1), typeSpeed);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("deleting"), holdMs);
      return () => clearTimeout(t);
    }
    if (phase === "deleting") {
      if (count > 0) {
        const t = setTimeout(() => setCount((c) => c - 1), deleteSpeed);
        return () => clearTimeout(t);
      }
      setIndex((i) => (i + 1) % words.length);
      setPhase("typing");
    }
  }, [phase, count, index, words, typeSpeed, deleteSpeed, holdMs]);

  const longest = words.reduce((a, b) => (a.length >= b.length ? a : b), "");
  const current = words[index].slice(0, count);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {/* Spacer reserves layout width using the longest word so nothing reflows */}
      <span aria-hidden className={className} style={{ ...style, visibility: "hidden", whiteSpace: "pre" }}>
        {longest}
      </span>
      {/* Visible animated word — gradient/className applied here so bg-clip-text works */}
      <span
        aria-hidden
        className={className}
        style={{ ...style, position: "absolute", left: 0, top: 0, whiteSpace: "pre" }}
      >
        {current}
      </span>
      {/* Cursor — sits after the typed word, positioned via absolute + width measurement is hard,
          so we render it inline at the right edge of the visible word */}
      <span
        aria-hidden
        className="inline-block align-baseline animate-pulse"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          whiteSpace: "pre",
          color: "transparent",
        }}
      >
        {current}
        <span
          style={{
            display: "inline-block",
            width: "0.06em",
            height: "0.85em",
            marginLeft: "0.05em",
            background: "linear-gradient(180deg, #3B82F6 0%, #7C3AED 100%)",
            verticalAlign: "-0.08em",
          }}
        />
      </span>
      <span className="sr-only">{words[index]}</span>
    </span>
  );
}

export default TypewriterLoop;