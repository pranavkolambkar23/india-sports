"use client";

import { useEffect, useState } from "react";

const sportEmojis = ["🏏", "⚽", "🏸", "🏑", "🏐", "🥊"];

export function LoadingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sportEmojis.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Animated sport icons */}
      <div className="flex items-center gap-3">
        {sportEmojis.map((emoji, i) => (
          <span
            key={i}
            className="text-3xl transition-all duration-300"
            style={{
              opacity: i === activeIndex ? 1 : 0.25,
              transform: i === activeIndex ? "scale(1.5) translateY(-8px)" : "scale(1) translateY(0)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Gradient loading bar */}
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #f97316, #eab308, #22c55e, #3b82f6, #f97316)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <p className="text-sm text-muted-foreground font-medium tracking-wide animate-pulse">
        Loading...
      </p>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
