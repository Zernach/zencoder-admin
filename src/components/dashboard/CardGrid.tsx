import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 6;
  gap?: number;
}

export function CardGrid({
  children,
  columns = 4,
  gap = 16,
}: CardGridProps) {
  const { width } = useWindowDimensions();

  let effectiveCols: number = columns;
  if (width < 768) effectiveCols = 1;
  else if (width < 1024) effectiveCols = Math.min(columns, 2);

  const childArray = React.Children.toArray(children);

  return (
    <View style={[styles.grid, { gap }]}>
      {childArray.map((child, i) => (
        <View
          key={i}
          style={{
            flex: effectiveCols === 1 ? undefined : 1,
            width: effectiveCols === 1 ? "100%" : undefined,
            minWidth:
              effectiveCols > 1
                ? `${Math.floor(100 / effectiveCols) - 2}%`
                : undefined,
            maxWidth:
              effectiveCols > 1
                ? `${Math.floor(100 / effectiveCols)}%`
                : undefined,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
