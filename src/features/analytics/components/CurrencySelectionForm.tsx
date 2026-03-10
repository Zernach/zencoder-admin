import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs";
import { Check } from "lucide-react-native";
import { CURRENCY_OPTIONS, type CurrencyCode } from "@/types/settings";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";
import { typography } from "@/theme/typography";

interface CurrencySelectionFormProps {
  selectedCurrency: CurrencyCode;
  onSelect: (code: CurrencyCode) => void;
}

export function CurrencySelectionForm({
  selectedCurrency,
  onSelect,
}: CurrencySelectionFormProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const [filter, setFilter] = useState("");

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const handlerCache = useRef(new Map<string, () => void>()).current;
  const getHandler = useCallback(
    (code: CurrencyCode) => {
      let handler = handlerCache.get(code);
      if (!handler) {
        handler = () => onSelectRef.current(code);
        handlerCache.set(code, handler);
      }
      return handler;
    },
    [handlerCache],
  );

  const filtered = useMemo(() => {
    if (!filter.trim()) return CURRENCY_OPTIONS;
    const q = filter.trim().toLowerCase();
    return CURRENCY_OPTIONS.filter(
      (o) =>
        o.code.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {t("settings.selectCurrency")}
      </Text>
      <CustomTextInput
        containerStyle={styles.searchContainer}
        style={styles.searchInput}
        placeholder={t("settings.searchCurrency")}
        value={filter}
        onChangeText={setFilter}
        accessibilityLabel={t("settings.searchCurrency")}
      />
      <View style={styles.list}>
        {filtered.map((option) => {
          const isSelected = option.code === selectedCurrency;
          return (
            <CustomButton
              key={option.code}
              onPress={getHandler(option.code)}
              style={[
                styles.row,
                { borderColor: theme.border.default },
                isSelected && {
                  borderColor: theme.border.brand,
                  backgroundColor: theme.bg.brandSubtle,
                },
              ]}
              accessibilityRole="radio"
              accessibilityLabel={`${option.code} — ${option.name}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.symbol, { color: theme.text.secondary }]}>
                {option.symbol}
              </Text>
              <View style={styles.labelColumn}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.text.primary },
                    isSelected && { color: theme.text.brand },
                  ]}
                >
                  {option.code}
                </Text>
                <Text style={[styles.sublabel, { color: theme.text.tertiary }]}>
                  {option.name}
                </Text>
              </View>
              {isSelected && (
                <Check size={18} color={theme.text.brand} />
              )}
            </CustomButton>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[12],
  },
  title: {
    fontFamily: typography.sectionTitle.fontFamily,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  searchContainer: {
    minHeight: 0,
  },
  searchInput: {
    fontSize: 13,
  },
  list: {
    gap: spacing[6],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[10],
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing[12],
  },
  symbol: {
    fontFamily: typography.codeValue.fontFamily,
    fontSize: 16,
    fontWeight: "600",
    width: 32,
    textAlign: "center",
  },
  labelColumn: {
    flex: 1,
    gap: spacing[2],
  },
  label: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: 14,
    fontWeight: "600",
  },
  sublabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
  },
});
