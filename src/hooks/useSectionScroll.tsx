import React, { createContext, useContext, useRef, useCallback } from "react";
import { findNodeHandle, UIManager } from "react-native";
import { isWeb } from "@/constants/platform";

interface ScrollableViewRef {
  scrollTo: (options: { x?: number; y?: number; animated?: boolean }) => void;
}

interface ScrollableSectionRef {
  scrollIntoView?: (options?: ScrollIntoViewOptions) => void;
}

interface SectionScrollContextValue {
  /** Scroll the active viewport to the section with the given ID. */
  scrollToSection: (sectionId: string) => void;
  /** Called by ContentViewport to register the active ScrollView. */
  registerScrollView: (ref: ScrollableViewRef | null) => void;
  /** Called by screens to register a section View ref for native scroll targeting. */
  registerSection: (sectionId: string, ref: unknown) => void;
}

const SectionScrollContext = createContext<SectionScrollContextValue>({
  scrollToSection: () => {},
  registerScrollView: () => {},
  registerSection: () => {},
});

export function SectionScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollViewRef = useRef<ScrollableViewRef | null>(null);
  const sectionRefs = useRef<Map<string, unknown>>(new Map());

  const registerScrollView = useCallback((ref: ScrollableViewRef | null) => {
    scrollViewRef.current = ref;
  }, []);

  const registerSection = useCallback((sectionId: string, ref: unknown) => {
    if (ref) {
      sectionRefs.current.set(sectionId, ref);
    } else {
      sectionRefs.current.delete(sectionId);
    }
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    if (isWeb) {
      const sectionRef = sectionRefs.current.get(sectionId) as ScrollableSectionRef | undefined;
      if (sectionRef?.scrollIntoView) {
        sectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Native: measure section position relative to ScrollView and scroll
    const sectionRef = sectionRefs.current.get(sectionId);
    const sv = scrollViewRef.current;
    if (!sectionRef || !sv) return;

    const sectionNode = findNodeHandle(sectionRef as React.Component);
    const scrollNode = findNodeHandle(sv as unknown as React.Component);
    if (sectionNode == null || scrollNode == null) return;

    UIManager.measureLayout(
      sectionNode,
      scrollNode,
      () => {},
      (_x: number, y: number) => {
        sv.scrollTo({ y, animated: true });
      },
    );
  }, []);

  return (
    <SectionScrollContext.Provider value={{ scrollToSection, registerScrollView, registerSection }}>
      {children}
    </SectionScrollContext.Provider>
  );
}

export function useSectionScroll() {
  return useContext(SectionScrollContext);
}
