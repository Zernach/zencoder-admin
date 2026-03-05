import { useReducer } from "react";

export interface UseTriggerRerenderResult {
  key: number;
  triggerRerender: () => void;
}

/**
 * Triggers a component re-render on demand while keeping mutable state in refs.
 */
export function useTriggerRerender(): UseTriggerRerenderResult {
  const [key, triggerRerender] = useReducer((currentKey: number) => currentKey + 1, 0);

  return {
    key,
    triggerRerender,
  };
}

