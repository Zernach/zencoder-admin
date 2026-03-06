import React, { useCallback } from "react";
import { CustomButton } from "@/components/buttons";
import { LoadingSkeleton, EmptyState } from "@/components/dashboard";
import { CustomList } from "@/components/lists";

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
  estimatedItemSize: _estimatedItemSize = 72,
}: DataListProps<T>) {
  const renderListItem = useCallback(
    ({ item }: { item: T }) => {
      const content = renderItem(item);
      if (onItemPress) {
        return (
          <CustomButton
            onPress={() => onItemPress(item)}
            accessibilityRole="button"
          >
            {content}
          </CustomButton>
        );
      }
      return <>{content}</>;
    },
    [renderItem, onItemPress]
  );
  const extractKey = useCallback(
    (item: T) => keyExtractor(item),
    [keyExtractor],
  );

  if (loading) return <LoadingSkeleton variant="table" rows={5} />;
  if (data.length === 0)
    return <EmptyState message={emptyMessage ?? "No data available."} />;

  return (
    <CustomList
      flatListProps={{
        data,
        renderItem: renderListItem,
        keyExtractor: extractKey,
      }}
    />
  );
}
