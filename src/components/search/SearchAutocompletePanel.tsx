import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists";
import type { SearchSuggestionsResponse, SearchSuggestion } from "@/features/analytics/types";
import { SearchSuggestionSection } from "./SearchSuggestionSection";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface SearchAutocompletePanelProps {
  suggestions: SearchSuggestionsResponse | null;
  loading: boolean;
  error: string | undefined;
  onSelect: (suggestion: SearchSuggestion) => void;
  onDismiss: () => void;
  visible: boolean;
}

export function SearchAutocompletePanel({
  suggestions,
  loading,
  error,
  onSelect,
  onDismiss,
  visible,
}: SearchAutocompletePanelProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  if (!visible) return null;

  const hasGroups = suggestions && suggestions.groups.length > 0;
  const isEmpty = suggestions && suggestions.groups.length === 0 && !loading;

  return (
    <>
      <CustomButton
        style={styles.backdrop}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss search suggestions"
      />
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.bg.surface,
            borderColor: theme.border.default,
          },
        ]}
        accessibilityRole="list"
        accessibilityLabel="Search suggestions"
      >
        <CustomList
          scrollViewProps={{
            style: styles.scroll,
            keyboardShouldPersistTaps: "handled",
            showsVerticalScrollIndicator: false,
          }}
        >
          {loading && !hasGroups && (
            <Text style={[styles.stateText, { color: theme.text.secondary }]}>Searching...</Text>
          )}
          {error && (
            <Text style={[styles.stateText, { color: theme.state.error }]}>{error}</Text>
          )}
          {isEmpty && !error && (
            <Text style={[styles.stateText, { color: theme.text.secondary }]}>No results found</Text>
          )}
          {hasGroups &&
            suggestions.groups.map((group) => (
              <SearchSuggestionSection key={group.entityType} group={group} onSelect={onSelect} />
            ))}
        </CustomList>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 98,
  },
  panel: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxWidth: 400,
    maxHeight: 360,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    zIndex: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  scroll: {
    paddingVertical: 6,
  },
  stateText: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlign: "center",
  },
});
