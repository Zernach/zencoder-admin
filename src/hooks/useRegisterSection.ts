import { useCallback, useRef } from "react";
import { useSectionScroll } from "@/hooks/useSectionScroll";

/**
 * Returns a stable ref callback factory for registering sections with the scroll system.
 * Caches callbacks per sectionId to avoid creating new function references on every render,
 * which would cause unnecessary reconciliation work on View components.
 *
 * Usage: const refFor = useSectionRef();
 *        <View ref={refFor("my-section")} nativeID="my-section" />
 */
export function useSectionRef() {
  const { registerSection } = useSectionScroll();
  const callbackCache = useRef(new Map<string, (ref: unknown) => void>()).current;

  const getRef = useCallback(
    (sectionId: string) => {
      let cached = callbackCache.get(sectionId);
      if (!cached) {
        cached = (ref: unknown) => registerSection(sectionId, ref);
        callbackCache.set(sectionId, cached);
      }
      return cached;
    },
    [registerSection],
  );

  return getRef;
}
