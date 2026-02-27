import React, { useCallback } from "react";
import { Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LoadingSkeleton, EmptyState } from "@/components/dashboard";

interface DataListProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  onItemPress?: (item: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  estimatedItemSize?: number;
}

export type { DataListProps };

export function DataList<T>({
  data,
  renderItem,
  onItemPress,
  loading,
  emptyMessage,
  keyExtractor,
  estimatedItemSize = 72,
}: DataListProps<T>) {
  const renderFlashItem = useCallback(
    ({ item }: { item: T }) => {
      const content = renderItem(item);
      if (onItemPress) {
        return (
          <Pressable
            onPress={() => onItemPress(item)}
            accessibilityRole="button"
          >
            {content}
          </Pressable>
        );
      }
      return <>{content}</>;
    },
    [renderItem, onItemPress]
  );

  if (loading) return <LoadingSkeleton variant="table" rows={5} />;
  if (data.length === 0)
    return <EmptyState message={emptyMessage ?? "No data available."} />;

  return (
    <FlashList
      data={data}
      renderItem={renderFlashItem}
      keyExtractor={keyExtractor}
    />
  );
}
