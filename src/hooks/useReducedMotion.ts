import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.matchMedia) {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      }
    } else {
      AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
      const sub = AccessibilityInfo.addEventListener(
        "reduceMotionChanged",
        setReduced
      );
      return () => sub.remove();
    }
  }, []);

  return reduced;
}
