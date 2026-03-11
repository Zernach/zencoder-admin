import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, type ListRenderItemInfo } from "react-native";
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

export function ChatHistoryFilters({
  selectedTopics,
  onToggleTopic,
  onClearTopics,
}: ChatHistoryFiltersProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const selectedSet = useMemo(() => new Set<ChatTopic>(selectedTopics), [selectedTopics]);
  const showClearButton = selectedTopics.length > 0;

  const renderTopicFilter = useCallback(
    ({ item: topic }: ListRenderItemInfo<ChatTopic>) => {
      const selected = selectedSet.has(topic);
      return (
        <CustomButton
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
    },
    [
      onToggleTopic,
      selectedSet,
      theme.bg.brandSubtle,
      theme.bg.surface,
      theme.border.brand,
      theme.border.default,
      theme.text.brand,
      theme.text.secondary,
    ],
  );

  const keyTopicFilter = useCallback((topic: ChatTopic) => topic, []);

  const renderFilterSeparator = useCallback(
    () => <View style={styles.filterSeparator} />,
    [],
  );

  const listHeader = useMemo(
    () => <Filter size={14} color={theme.text.tertiary} style={styles.filterIcon} />,
    [theme.text.tertiary],
  );

  const listFooter = useMemo(() => {
    if (!showClearButton) {
      return null;
    }

    return (
      <CustomButton
        onPress={onClearTopics}
        style={styles.clearButton}
        accessibilityRole="button"
        accessibilityLabel="Clear topic filters"
      >
        <Text style={[styles.clearButtonText, { color: theme.border.brand }]}>
          Clear All
        </Text>
      </CustomButton>
    );
  }, [onClearTopics, showClearButton, theme.border.brand]);

  return (
    <View style={styles.container}>
      <CustomList
        flatListProps={{
          data: CHAT_HISTORY_TOPIC_OPTIONS,
          renderItem: renderTopicFilter,
          keyExtractor: keyTopicFilter,
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          contentContainerStyle: styles.filterListContent,
          ItemSeparatorComponent: renderFilterSeparator,
          ListHeaderComponent: listHeader,
          ListFooterComponent: listFooter,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[8],
  },
  filterListContent: {
    alignItems: "center",
    paddingRight: spacing[8],
  },
  filterSeparator: {
    width: spacing[8],
  },
  filterIcon: {
    marginRight: spacing[8],
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
    marginLeft: spacing[8],
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
