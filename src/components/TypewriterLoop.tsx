import { useEffect, useState } from "react";

interface TypewriterLoopProps {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  holdMs?: number;
  className?: string;
  startDelay?: number;
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
    <span className={className} style={{ position: "relative", display: "inline-block" }}>
      <span aria-hidden style={{ visibility: "hidden", whiteSpace: "pre" }}>{longest}</span>
      <span
        aria-hidden
        style={{ position: "absolute", left: 0, top: 0, whiteSpace: "pre" }}
      >
        {current}
        <span
          aria-hidden
          className="inline-block align-baseline animate-pulse"
          style={{
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