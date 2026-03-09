import { useState, useEffect, useCallback } from "react";
import { Dimensions } from "react-native";

export type BreakpointName = "mobile" | "tablet" | "desktop";

function getBreakpoint(width: number): BreakpointName {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function useBreakpoint(): BreakpointName {
  const [bp, setBp] = useState<BreakpointName>(
    getBreakpoint(Dimensions.get("window").width)
  );

  const handleChange = useCallback(({ window }: { window: { width: number } }) => {
    const next = getBreakpoint(window.width);
    setBp((prev) => (prev === next ? prev : next));
  }, []);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", handleChange);
    return () => sub.remove();
  }, [handleChange]);

  return bp;
}
