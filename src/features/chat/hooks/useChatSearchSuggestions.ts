import { useCallback, useMemo, useState } from "react";
import type {
  SearchSuggestion,
  SearchSuggestionGroup,
  SearchSuggestionsResponse,
} from "@/features/analytics/types";
import type { ChatConversationSummary } from "@/features/chat/types";
import { formatRelativeTime } from "@/utils";

const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 8;

interface UseChatSearchSuggestionsResult {
  suggestions: SearchSuggestionsResponse | null;
  loading: boolean;
  error: string | undefined;
  selectSuggestion: (suggestion: SearchSuggestion) => void;
  setQuery: (query: string) => void;
  clear: () => void;
  query: string;
}

export function useChatSearchSuggestions(
  items: ChatConversationSummary[] | undefined,
  onSelect: (suggestion: SearchSuggestion) => void,
): UseChatSearchSuggestionsResult {
  const [query, setQuery] = useState("");

  const suggestions = useMemo<SearchSuggestionsResponse | null>(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length < MIN_QUERY_LENGTH || !items?.length) return null;

    const matches: SearchSuggestion[] = [];

    for (const item of items) {
      const titleMatch = item.title.toLowerCase().includes(trimmed);
      const previewMatch = item.preview.toLowerCase().includes(trimmed);

      if (titleMatch || previewMatch) {
        matches.push({
          id: item.id,
          entityType: "chat",
          title: item.title,
          subtitle: titleMatch
            ? formatRelativeTime(item.updatedAtIso)
            : item.preview.length > 60
              ? `${item.preview.slice(0, 60)}\u2026`
              : item.preview,
        });
      }

      if (matches.length >= MAX_SUGGESTIONS) break;
    }

    if (matches.length === 0) return { groups: [], totalCount: 0 };

    const groups: SearchSuggestionGroup[] = [
      { entityType: "chat", label: "Conversations", suggestions: matches },
    ];

    return { groups, totalCount: matches.length };
  }, [items, query]);

  const clear = useCallback(() => setQuery(""), []);

  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => onSelect(suggestion),
    [onSelect],
  );

  return {
    suggestions,
    loading: false,
    error: undefined,
    selectSuggestion,
    setQuery,
    clear,
    query,
  };
}
