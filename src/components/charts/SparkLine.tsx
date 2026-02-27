import React from "react";
import Svg, { Path } from "react-native-svg";
import { scaleLinear } from "d3-scale";
import { line, curveMonotoneX } from "d3-shape";

interface SparkLineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function SparkLine({
  data,
  color = "#30a8dc",
  width = 80,
  height = 24,
}: SparkLineProps) {
  if (data.length < 2) return null;

  const padding = 2;
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

  const pathD = lineGen(data) ?? "";

  return (
    <Svg width={width} height={height}>
      <Path d={pathD} fill="none" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}
