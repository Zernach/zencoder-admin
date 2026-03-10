import { useMemo } from "react";
import { useAppSelector, selectSelectedCurrency } from "@/store";
import { getCurrencySymbol } from "@/constants/currencies";
import { convertFromEUR } from "@/features/analytics/utils/currencyConverter";
import {
  formatCurrency as rawFormatCurrency,
  formatCostPerToken as rawFormatCostPerToken,
  formatCompactCurrency as rawFormatCompactCurrency,
} from "@/features/analytics/utils/formatters";
import type { CurrencyCode } from "@/types/settings";

export interface CurrencyFormatter {
  /** Format an amount (assumed EUR) into the user's selected currency. */
  formatCurrency: (amountEUR: number) => string;
  /** Format a per-token cost (assumed EUR) into the user's selected currency. */
  formatCostPerToken: (amountPerTokenEUR: number) => string;
  /** Format an amount (assumed EUR) into compact form in the user's selected currency. */
  formatCompactCurrency: (amountEUR: number) => string;
  /** The currently selected currency code. */
  currencyCode: CurrencyCode;
  /** The display symbol for the selected currency. */
  currencySymbol: string;
}

/**
 * Returns currency-aware formatting functions pre-bound to the
 * user's selected currency from Redux. All input amounts are
 * assumed to be in EUR and are converted automatically.
 */
export function useCurrencyFormatter(): CurrencyFormatter {
  const currencyCode = useAppSelector(selectSelectedCurrency);

  return useMemo(() => {
    const currencySymbol = getCurrencySymbol(currencyCode);
    return {
      formatCurrency: (amountEUR: number) =>
        rawFormatCurrency(convertFromEUR(amountEUR, currencyCode), currencyCode),
      formatCostPerToken: (amountPerTokenEUR: number) =>
        rawFormatCostPerToken(convertFromEUR(amountPerTokenEUR, currencyCode), currencyCode),
      formatCompactCurrency: (amountEUR: number) =>
        rawFormatCompactCurrency(convertFromEUR(amountEUR, currencyCode), currencyCode),
      currencyCode,
      currencySymbol,
    };
  }, [currencyCode]);
}
