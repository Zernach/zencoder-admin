import { useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Line, Text as SvgText } from "react-native-svg";
import { scaleTime, scaleLinear } from "d3-scale";
import { line, area, curveMonotoneX } from "d3-shape";
import type { TimeSeriesPoint } from "@/features/analytics/types";
import { formatCompactNumber } from "@/features/analytics/utils/formatters";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface TrendChartProps {
  data: TimeSeriesPoint[];
  variant: "line" | "area";
  color?: string;
  fillOpacity?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  showGrid?: boolean;
}

const MARGIN = { top: 8, right: 8, bottom: 24, left: 44 };

export function TrendChart({
  data,
  variant,
  color,
  fillOpacity = 0.15,
  height = 200,
  showGrid = true,
}: TrendChartProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const resolvedColor = color ?? theme.data.seriesPrimary;
  const [containerWidth, setContainerWidth] = useState(300);

  if (data.length === 0) return null;

  const width = containerWidth;
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const dates = data.map((d) => new Date(d.tsIso));
  const values = data.map((d) => d.value);
  const xScale = scaleTime()
    .domain([dates[0]!, dates[dates.length - 1]!])
    .range([0, innerW]);
  const yMax = Math.max(...values, 1);
  const yScale = scaleLinear().domain([0, yMax]).range([innerH, 0]).nice();

  const lineGen = line<TimeSeriesPoint>()
    .x((d) => xScale(new Date(d.tsIso)))
    .y((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const areaGen = area<TimeSeriesPoint>()
    .x((d) => xScale(new Date(d.tsIso)))
    .y0(innerH)
    .y1((d) => yScale(d.value))
    .curve(curveMonotoneX);

  const pathD = lineGen(data) ?? "";
  const areaD = areaGen(data) ?? "";
  const yTicks = yScale.ticks(5);
  const xTicks = xScale.ticks(Math.min(data.length, 6));

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Svg width={width} height={height}>
        {showGrid &&
          yTicks.map((t) => (
            <Line
              key={`g-${t}`}
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={MARGIN.top + yScale(t)}
              y2={MARGIN.top + yScale(t)}
              stroke={theme.border.subtle}
              strokeDasharray="4,4"
            />
          ))}
        {variant === "area" && (
          <Path
            d={areaD}
            fill={resolvedColor}
            fillOpacity={fillOpacity}
            transform={`translate(${MARGIN.left},${MARGIN.top})`}
          />
        )}
        <Path
          d={pathD}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={2}
          transform={`translate(${MARGIN.left},${MARGIN.top})`}
        />
        {yTicks.map((t) => (
          <SvgText
            key={`y-${t}`}
            x={MARGIN.left - 6}
            y={MARGIN.top + yScale(t) + 4}
            fontSize={10}
            fill={theme.text.tertiary}
            textAnchor="end"
          >
            {formatCompactNumber(t)}
          </SvgText>
        ))}
        {xTicks.map((t) => (
          <SvgText
            key={`x-${t.getTime()}`}
            x={MARGIN.left + xScale(t)}
            y={height - 4}
            fontSize={10}
            fill={theme.text.tertiary}
            textAnchor="middle"
          >
            {t.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
