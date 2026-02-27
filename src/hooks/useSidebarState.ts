import { useState, useCallback, useEffect } from "react";
import { useBreakpoint } from "./useBreakpoint";

export function useSidebarState() {
  const breakpoint = useBreakpoint();
  const [expanded, setExpanded] = useState(breakpoint === "desktop");

  useEffect(() => {
    if (breakpoint === "tablet") setExpanded(false);
    if (breakpoint === "desktop") setExpanded(true);
  }, [breakpoint]);

  const toggle = useCallback(() => setExpanded((e) => !e), []);
  const expand = useCallback(() => setExpanded(true), []);
  const collapse = useCallback(() => setExpanded(false), []);

  return { expanded, toggle, expand, collapse };
}
