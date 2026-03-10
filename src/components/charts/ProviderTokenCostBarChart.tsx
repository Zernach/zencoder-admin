import React, { useMemo } from "react";
import type { ProviderCostRow } from "@/features/analytics/types";
import { formatCompactNumber, formatPercent } from "@/features/analytics/utils/formatters";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { BreakdownChart, type BreakdownChartDatum } from "./BreakdownChart";

interface ProviderTokenCostBarChartProps {
  data: ProviderCostRow[];
}

const PROVIDER_LABELS: Record<ProviderCostRow["provider"], string> = {
  codex: "Codex",
  claude: "Claude",
  other: "Other",
};

function computeCostPerToken(row: ProviderCostRow): number {
  if (row.totalTokens <= 0) return 0;
  return row.totalCostUsd / row.totalTokens;
}

function formatTenThousandths(usdPerToken: number): string {
  return Math.round(usdPerToken * 1_000_000).toLocaleString("en-US");
}

export const ProviderTokenCostBarChart = React.memo(function ProviderTokenCostBarChart({
  data,
}: ProviderTokenCostBarChartProps) {
  const { formatCurrency } = useCurrencyFormatter();
  const chartData = useMemo<BreakdownChartDatum[]>(() => {
    return data.map((row) => {
      const costPerToken = computeCostPerToken(row);
      return {
        key: PROVIDER_LABELS[row.provider],
        value: costPerToken,
        hoverRows: [
          { label: "Provider", value: PROVIDER_LABELS[row.provider] },
          { label: "Total Cost", value: formatCurrency(row.totalCostUsd) },
          { label: "Tokens", value: formatCompactNumber(row.totalTokens) },
          { label: "Runs", value: formatCompactNumber(row.runCount) },
          { label: "Share", value: formatPercent(row.percentOfTotal) },
        ],
      };
    });
  }, [data, formatCurrency]);

  return (
    <BreakdownChart
      data={chartData}
      variant="horizontal-bar"
      formatValue={formatTenThousandths}
      xLabel="ten-thousandths of a penny per token"
    />
  );
});
