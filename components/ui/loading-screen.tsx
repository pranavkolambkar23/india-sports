"use client";

import { useEffect, useState } from "react";
import { CircleDot, Dumbbell, Goal, Medal, Trophy, Waves } from "lucide-react";

const sportIcons = [Trophy, Goal, Medal, CircleDot, Dumbbell, Waves];

export function LoadingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % sportIcons.length);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
      <div className="flex items-center gap-3">
        {sportIcons.map((Icon, index) => {
          const active = index === activeIndex;

          return (
            <span
              key={index}
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-all duration-300"
              style={{
                opacity: active ? 1 : 0.25,
                transform: active
                  ? "scale(1.5) translateY(-8px)"
                  : "scale(1) translateY(0)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Icon
                className={
                  active
                    ? "h-5 w-5 text-orange-600"
                    : "h-5 w-5 text-muted-foreground"
                }
              />
            </span>
          );
        })}
      </div>

      <div className="h-1 w-48 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, #f97316, #eab308, #22c55e, #3b82f6, #f97316)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <p className="animate-pulse text-sm font-medium tracking-wide text-muted-foreground">
        Loading...
      </p>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
