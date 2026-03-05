import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDependencies } from "@/core/di";
import type {
  SearchSuggestionsResponse,
  SearchSuggestion,
} from "@/features/analytics/types";

const DEBOUNCE_MS = 200;
const MIN_QUERY_LENGTH = 2;

interface UseSearchAutocompleteResult {
  suggestions: SearchSuggestionsResponse | null;
  loading: boolean;
  error: string | undefined;
  query: string;
  setQuery: (q: string) => void;
  clear: () => void;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
  selectedSuggestion: SearchSuggestion | null;
}

export function useSearchAutocomplete(
  onSelect?: (suggestion: SearchSuggestion) => void,
): UseSearchAutocompleteResult {
  const { analyticsService } = useAppDependencies();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [selectedSuggestion, setSelectedSuggestion] = useState<SearchSuggestion | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions(null);
      setLoading(false);
      setError(undefined);
      return;
    }

    setLoading(true);
    const currentRequestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const result = await analyticsService.getSearchSuggestions({ query: query.trim() });
        if (currentRequestId === requestIdRef.current) {
          setSuggestions(result);
          setError(undefined);
        }
      } catch (err) {
        if (currentRequestId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : "Search failed");
          setSuggestions(null);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, analyticsService]);

  const clear = useCallback(() => {
    setQuery("");
    setSuggestions(null);
    setLoading(false);
    setError(undefined);
    setSelectedSuggestion(null);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setSelectedSuggestion(suggestion);
      setSuggestions(null);
      onSelect?.(suggestion);
    },
    [onSelect],
  );

  return {
    suggestions,
    loading,
    error,
    query,
    setQuery,
    clear,
    selectSuggestion,
    selectedSuggestion,
  };
}
