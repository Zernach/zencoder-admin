import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists";
import { Filter } from "lucide-react-native";
import type { ChatTopic } from "@/features/chat/types";
import { CHAT_HISTORY_TOPIC_OPTIONS } from "@/features/chat/filters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, radius, spacing } from "@/theme/tokens";

interface ChatHistoryFiltersProps {
  selectedTopics: readonly ChatTopic[];
  onToggleTopic: (topic: ChatTopic) => void;
  onClearTopics: () => void;
}

const FILTER_SCROLL_PROPS = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  } as const,
} as const;

export function ChatHistoryFilters({
  selectedTopics,
  onToggleTopic,
  onClearTopics,
}: ChatHistoryFiltersProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const selectedSet = useMemo(() => new Set<ChatTopic>(selectedTopics), [selectedTopics]);

  return (
    <View style={styles.container}>
      <CustomList scrollViewProps={FILTER_SCROLL_PROPS}>
        <Filter size={14} color={theme.text.tertiary} style={styles.filterIcon} />
        {CHAT_HISTORY_TOPIC_OPTIONS.map((topic) => {
          const selected = selectedSet.has(topic);

          return (
            <CustomButton
              key={topic}
              onPress={() => onToggleTopic(topic)}
              style={[
                styles.optionButton,
                {
                  borderColor: selected ? theme.border.brand : theme.border.default,
                  backgroundColor: selected ? theme.bg.brandSubtle : theme.bg.surface,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Toggle ${topic} topic filter`}
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: selected ? theme.text.brand : theme.text.secondary },
                ]}
              >
                {topic}
              </Text>
            </CustomButton>
          );
        })}
        {selectedTopics.length > 0 ? (
          <CustomButton
            onPress={onClearTopics}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear topic filters"
          >
            <Text style={[styles.clearButtonText, { color: theme.border.brand }]}>Clear All</Text>
          </CustomButton>
        ) : null}
      </CustomList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[8],
  },
  filterIcon: {
    marginRight: spacing[2],
  },
  optionButton: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[6],
  },
  optionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  clearButton: {
    paddingHorizontal: spacing[4],
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
