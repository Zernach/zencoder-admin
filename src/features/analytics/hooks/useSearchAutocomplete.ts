import { useCallback, useEffect, useRef, useState } from "react";
import { useGetSearchSuggestionsQuery } from "@/store/api";
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
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<SearchSuggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setDebouncedQuery("");
      return;
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const shouldSkip = debouncedQuery.length < MIN_QUERY_LENGTH || dismissed;

  const { data, isLoading, error } = useGetSearchSuggestionsQuery(
    { query: debouncedQuery },
    { skip: shouldSkip },
  );

  const clear = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedSuggestion(null);
    setDismissed(false);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setSelectedSuggestion(suggestion);
      setDismissed(true);
      onSelect?.(suggestion);
    },
    [onSelect],
  );

  const handleSetQuery = useCallback((q: string) => {
    setQuery(q);
    setDismissed(false);
  }, []);

  return {
    suggestions: shouldSkip ? null : (data ?? null),
    loading: shouldSkip ? false : isLoading,
    error: error ? String(error) : undefined,
    query,
    setQuery: handleSetQuery,
    clear,
    selectSuggestion,
    selectedSuggestion,
  };
}
