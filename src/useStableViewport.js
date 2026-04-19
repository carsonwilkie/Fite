import { useEffect, useState } from "react";

function isTouchViewport() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches ||
    window.innerWidth <= 900
  );
}

export function toViewportCssValue(value, fallback = "100vh") {
  return value ? `${value}px` : fallback;
}

export default function useStableViewport() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const readViewport = () => ({
      width: Math.round(window.innerWidth),
      height: Math.round(window.innerHeight),
    });

    const updateViewport = () => {
      const next = readViewport();

      setViewport((prev) => {
        if (!isTouchViewport()) {
          return next;
        }

        // Ignore height-only changes from mobile browser chrome expanding/collapsing.
        if (!prev.width || Math.abs(next.width - prev.width) > 24) {
          return next;
        }

        return prev.height ? prev : next;
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  return viewport;
}
