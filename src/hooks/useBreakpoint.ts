import { useState, useEffect } from "react";
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

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setBp(getBreakpoint(window.width));
    });
    return () => sub.remove();
  }, []);

  return bp;
}
