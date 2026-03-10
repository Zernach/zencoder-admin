import React, { useCallback, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { Check } from "lucide-react-native";
import { LANGUAGE_OPTIONS, type LanguageCode } from "@/types/settings";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";
import { typography } from "@/theme/typography";

interface LanguageSelectionFormProps {
  selectedLanguage: LanguageCode;
  onSelect: (code: LanguageCode) => void;
}

export function LanguageSelectionForm({
  selectedLanguage,
  onSelect,
}: LanguageSelectionFormProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const handlerCache = useRef(new Map<string, () => void>()).current;
  const getHandler = useCallback(
    (code: LanguageCode) => {
      let handler = handlerCache.get(code);
      if (!handler) {
        handler = () => onSelectRef.current(code);
        handlerCache.set(code, handler);
      }
      return handler;
    },
    [handlerCache],
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Language
      </Text>
      <View style={styles.list}>
        {LANGUAGE_OPTIONS.map((option) => {
          const isSelected = option.code === selectedLanguage;
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
              accessibilityLabel={`${option.label} (${option.nativeLabel})`}
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.labelColumn}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.text.primary },
                    isSelected && { color: theme.text.brand },
                  ]}
                >
                  {option.nativeLabel}
                </Text>
                <Text style={[styles.sublabel, { color: theme.text.tertiary }]}>
                  {option.label}
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
  list: {
    gap: spacing[8],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  labelColumn: {
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
