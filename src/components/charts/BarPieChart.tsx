import React, { useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { fontFamilies, radius, spacing } from "@/theme/tokens";
import { ChartCardHeaderActionContext } from "./ChartCardHeaderActionContext";

export type BarPieChartMode = "bar" | "pie";

export interface BarPieChartProps {
  renderBar: () => ReactNode;
  renderPie: () => ReactNode;
  defaultMode?: BarPieChartMode;
  showModeToggle?: boolean;
  barLabel?: string;
  pieLabel?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export const BarPieChart = React.memo(function BarPieChart({
  renderBar,
  renderPie,
  defaultMode = "bar",
  showModeToggle = true,
  barLabel = "Bar",
  pieLabel = "Pie",
  containerStyle,
}: BarPieChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const chartCardHeaderActionContext = useContext(ChartCardHeaderActionContext);
  const isInsideChartCard = chartCardHeaderActionContext !== null;
  const [chartMode, setChartMode] = useState<BarPieChartMode>(defaultMode);

  useEffect(() => {
    setChartMode(defaultMode);
  }, [defaultMode]);

  const modeToggle = useMemo(
    () =>
      showModeToggle ? (
        <View
          testID={isInsideChartCard ? "bar-pie-chart-header-mode-toggle" : "bar-pie-chart-inline-mode-toggle"}
          style={[
            styles.modeToggleContainer,
            !isInsideChartCard && styles.modeToggleInlinePosition,
            {
              borderColor: theme.border.default,
              backgroundColor: theme.bg.surfaceElevated,
            },
          ]}
        >
          <Pressable
            testID="bar-pie-chart-mode-bar"
            accessibilityRole="button"
            accessibilityLabel="Show bar chart"
            onPress={() => setChartMode("bar")}
            style={[
              styles.modeToggleButton,
              chartMode === "bar" && {
                borderColor: theme.border.brand,
                backgroundColor: theme.bg.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.modeToggleText,
                { color: chartMode === "bar" ? theme.text.primary : theme.text.secondary },
              ]}
            >
              {barLabel}
            </Text>
          </Pressable>
          <Pressable
            testID="bar-pie-chart-mode-pie"
            accessibilityRole="button"
            accessibilityLabel="Show pie chart"
            onPress={() => setChartMode("pie")}
            style={[
              styles.modeToggleButton,
              chartMode === "pie" && {
                borderColor: theme.border.brand,
                backgroundColor: theme.bg.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.modeToggleText,
                { color: chartMode === "pie" ? theme.text.primary : theme.text.secondary },
              ]}
            >
              {pieLabel}
            </Text>
          </Pressable>
        </View>
      ) : null,
    [
      barLabel,
      chartMode,
      isInsideChartCard,
      pieLabel,
      showModeToggle,
      theme.bg.surface,
      theme.bg.surfaceElevated,
      theme.border.brand,
      theme.border.default,
      theme.text.primary,
      theme.text.secondary,
    ],
  );

  useEffect(() => {
    if (!chartCardHeaderActionContext) {
      return;
    }

    chartCardHeaderActionContext.setHeaderAction(modeToggle);

    return () => {
      chartCardHeaderActionContext.setHeaderAction(null);
    };
  }, [chartCardHeaderActionContext, modeToggle]);

  return (
    <View style={[styles.container, containerStyle]}>
      {!isInsideChartCard ? modeToggle : null}
      <View testID={`bar-pie-chart-current-mode-${chartMode}`}>
        {chartMode === "bar" ? renderBar() : renderPie()}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  modeToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[2],
    borderWidth: 1,
    borderRadius: radius.full,
    gap: spacing[4],
  },
  modeToggleInlinePosition: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
  },
  modeToggleButton: {
    minHeight: 24,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  modeToggleText: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    fontWeight: "600",
  },
});
