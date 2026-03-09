import { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import type { KeyValueMetric } from "@/features/analytics/types";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { DATA_PALETTE } from "./palette";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface BreakdownChartProps {
  data: KeyValueMetric[];
  variant: "bar" | "horizontal-bar";
  color?: string;
  height?: number;
  showValues?: boolean;
  truncateLabels?: boolean;
}

export function BreakdownChart({
  data,
  variant = "bar",
  height = 200,
  showValues = true,
  truncateLabels = true,
}: BreakdownChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [measuredLabelWidth, setMeasuredLabelWidth] = useState<number>(0);
  const [measuredRowHeight, setMeasuredRowHeight] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const maxVal = Math.max(...sorted.map((d) => d.value), 1);
  const longestLabel = useMemo(
    () => sorted.reduce((longest, item) => (item.key.length > longest.length ? item.key : longest), ""),
    [sorted]
  );
  const effectiveLabelWidth = useMemo(() => {
    if (truncateLabels || measuredLabelWidth <= 0 || containerWidth <= 0) {
      return measuredLabelWidth > 0 ? measuredLabelWidth : undefined;
    }

    const minTrackWidth = 56;
    const valueWidth = showValues ? 48 : 0;
    const gapCount = showValues ? 2 : 1;
    const horizontalGaps = gapCount * 8;
    const maxAllowedLabelWidth = Math.max(80, containerWidth - valueWidth - horizontalGaps - minTrackWidth);
    return Math.min(measuredLabelWidth, maxAllowedLabelWidth);
  }, [truncateLabels, measuredLabelWidth, containerWidth, showValues]);

  const handleLongestLabelLayout = useCallback((width: number): void => {
    if (width > measuredLabelWidth) {
      setMeasuredLabelWidth(width);
    }
  }, [measuredLabelWidth]);

  const handleRowHeightLayout = useCallback((height: number): void => {
    if (height > measuredRowHeight) {
      setMeasuredRowHeight(height);
    }
  }, [measuredRowHeight]);

  if (variant === "horizontal-bar") {
    return (
      <View
        style={[styles.container, { minHeight: height }]}
        onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      >
        {!truncateLabels && longestLabel.length > 0 ? (
          <Text
            style={[styles.hBarLabel, styles.hBarLabelFull, styles.measureLabel, { color: theme.text.secondary }]}
            onLayout={(event) => handleLongestLabelLayout(event.nativeEvent.layout.width)}
          >
            {longestLabel}
          </Text>
        ) : null}
        {sorted.map((item, i) => (
          <View
            key={`${item.key}-${i}`}
            style={[
              styles.hBarRow,
              !truncateLabels && measuredRowHeight > 0
                ? { height: measuredRowHeight }
                : null,
            ]}
            onLayout={
              truncateLabels
                ? undefined
                : (event) => handleRowHeightLayout(event.nativeEvent.layout.height)
            }
          >
            <Text
              style={[
                styles.hBarLabel,
                { color: theme.text.secondary },
                !truncateLabels && styles.hBarLabelFull,
                !truncateLabels && effectiveLabelWidth ? { width: effectiveLabelWidth } : null,
              ]}
              numberOfLines={truncateLabels ? 1 : undefined}
            >
              {item.key}
            </Text>
            <View style={[styles.hBarTrack, { backgroundColor: theme.bg.surfaceElevated }]}>
              <View
                style={[
                  styles.hBarFill,
                  {
                    width: `${(item.value / maxVal) * 100}%`,
                    backgroundColor:
                      DATA_PALETTE[i % DATA_PALETTE.length],
                  },
                ]}
              />
            </View>
            {showValues && (
              <Text style={[styles.hBarValue, { color: theme.text.primary }]}>
                {formatCompactNumber(item.value)}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }

  // Vertical bars
  return (
    <View style={[styles.barContainer, { height }]}>
      {sorted.map((item, i) => (
        <View key={`${item.key}-${i}`} style={styles.barCol}>
          <View style={styles.barWrapper}>
            {showValues && (
              <Text style={[styles.barValue, { color: theme.text.secondary }]}>
                {formatCompactNumber(item.value)}
              </Text>
            )}
            <View
              style={[
                styles.bar,
                {
                  height: `${(item.value / maxVal) * 70}%`,
                  backgroundColor:
                    DATA_PALETTE[i % DATA_PALETTE.length],
                },
              ]}
            />
          </View>
          <Text style={[styles.barLabel, { color: theme.text.tertiary }]} numberOfLines={1}>
            {item.key}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  hBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hBarLabel: {
    width: 80,
    fontSize: 11,
  },
  hBarLabelFull: {
    flexShrink: 0,
  },
  measureLabel: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
  hBarTrack: {
    flex: 1,
    minWidth: 56,
    height: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  hBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  hBarValue: {
    width: 48,
    fontSize: 11,
    textAlign: "right",
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "80%",
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
});
