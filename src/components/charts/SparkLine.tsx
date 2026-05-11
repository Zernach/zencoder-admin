import React, { useMemo } from "react";
import Svg, { Line, Path, Rect } from "react-native-svg";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

type SparkLineVariant = "line" | "candlestick";

interface SparkLineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  variant?: SparkLineVariant;
}

export const SparkLine = React.memo(function SparkLine({
  data,
  color,
  width = 80,
  height = 24,
  variant = "line",
}: SparkLineProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const resolvedColor = color ?? theme.data.seriesPrimary;
  const padding = 2;
  const minimumBodyHeight = 1;

  const pathD = useMemo(() => {
    if (data.length < 2) return "";

    const xScale = scaleLinear()
      .domain([0, data.length - 1])
      .range([padding, width - padding]);
    const yMin = Math.min(...data);
    const yMax = Math.max(...data);
    const yScale = scaleLinear()
      .domain([yMin, yMax || 1])
      .range([height - padding, padding]);

    const lineGen = line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(curveMonotoneX);

    return lineGen(data) ?? "";
  }, [data, height, padding, width]);

  const candles = useMemo(() => {
    if (data.length < 2) return [];

    const xScale = scaleLinear()
      .domain([0, data.length - 1])
      .range([padding, width - padding]);
    const yMin = Math.min(...data);
    const yMax = Math.max(...data);
    const yRangeMax = yMax === yMin ? yMax + 1 : yMax;
    const yScale = scaleLinear()
      .domain([yMin, yRangeMax])
      .range([height - padding, padding]);
    const candleWidth = Math.max(2, Math.min(6, (width - padding * 2) / (data.length * 1.8)));

    return data.map((value, index) => {
      const open = index === 0 ? value : data[index - 1]!;
      const close = value;
      const x = xScale(index);
      const openY = yScale(open);
      const closeY = yScale(close);
      const highY = yScale(Math.max(open, close));
      const lowY = yScale(Math.min(open, close));
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(openY - closeY), minimumBodyHeight);
      const bodyX = x - candleWidth / 2;
      const colorToken =
        close > open ? theme.state.success : close < open ? theme.state.error : theme.text.secondary;

      return {
        x,
        highY,
        lowY,
        bodyTop,
        bodyHeight,
        bodyX,
        candleWidth,
        color: colorToken,
      };
    });
  }, [
    data,
    height,
    minimumBodyHeight,
    padding,
    theme.state.error,
    theme.state.success,
    theme.text.secondary,
    width,
  ]);

  if (variant === "line" && !pathD) return null;
  if (variant === "candlestick" && candles.length === 0) return null;

  return (
    <Svg width={width} height={height}>
      {variant === "line" ? (
        <Path d={pathD} fill="none" stroke={resolvedColor} strokeWidth={1.5} />
      ) : (
        candles.map((candle, index) => (
          <React.Fragment key={index}>
            <Line
              x1={candle.x}
              x2={candle.x}
              y1={candle.highY}
              y2={candle.lowY}
              stroke={theme.text.tertiary}
              strokeWidth={1}
            />
            <Rect
              x={candle.bodyX}
              y={candle.bodyTop}
              width={candle.candleWidth}
              height={candle.bodyHeight}
              rx={0.8}
              fill={candle.color}
            />
          </React.Fragment>
        ))
      )}
    </Svg>
  );
});
