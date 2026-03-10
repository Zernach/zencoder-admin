import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import type { SearchSuggestion, SearchSuggestionGroup } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

interface SearchSuggestionSectionProps {
  group: SearchSuggestionGroup;
  onSelect: (suggestion: SearchSuggestion) => void;
}

export function SearchSuggestionSection({ group, onSelect }: SearchSuggestionSectionProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  return (
    <View style={styles.section} accessibilityRole="list">
      <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>{group.label}</Text>
      {group.suggestions.map((suggestion) => (
        <CustomButton
          key={suggestion.id}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: pressed ? theme.bg.subtle : "transparent" },
          ]}
          onPress={() => onSelect(suggestion)}
          accessibilityRole="button"
          accessibilityLabel={`${suggestion.title}${suggestion.subtitle ? `, ${suggestion.subtitle}` : ""}`}
        >
          <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
            {suggestion.title}
          </Text>
          {suggestion.subtitle ? (
            <Text style={[styles.subtitle, { color: theme.text.secondary }]} numberOfLines={1}>
              {suggestion.subtitle}
            </Text>
          ) : null}
        </CustomButton>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[2],
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[6],
  },
  row: {
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: radius.sm,
    marginHorizontal: spacing[4],
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 11,
    marginTop: spacing[2],
  },
});
