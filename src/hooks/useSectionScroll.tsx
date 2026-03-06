import React, { createContext, useContext, useRef, useCallback } from "react";
import type { ScrollView } from "react-native";
import { findNodeHandle, UIManager } from "react-native";
import { isWeb } from "@/constants/platform";

interface SectionScrollContextValue {
  /** Scroll the active viewport to the section with the given ID. */
  scrollToSection: (sectionId: string) => void;
  /** Called by ContentViewport to register the active ScrollView. */
  registerScrollView: (ref: ScrollView | null) => void;
  /** Called by screens to register a section View ref for native scroll targeting. */
  registerSection: (sectionId: string, ref: unknown) => void;
}

const SectionScrollContext = createContext<SectionScrollContextValue>({
  scrollToSection: () => {},
  registerScrollView: () => {},
  registerSection: () => {},
});

export function SectionScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const sectionRefs = useRef<Map<string, unknown>>(new Map());

  const registerScrollView = useCallback((ref: ScrollView | null) => {
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
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Native: measure section position relative to ScrollView and scroll
    const sectionRef = sectionRefs.current.get(sectionId);
    const sv = scrollViewRef.current;
    if (!sectionRef || !sv) return;

    const sectionNode = findNodeHandle(sectionRef as React.Component);
    const scrollNode = findNodeHandle(sv);
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
