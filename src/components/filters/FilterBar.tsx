import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { CustomButton } from "@/components/buttons";
import { CustomModal } from "@/components/modals";
import { CustomList } from "@/components/lists";
import { ChevronDown, X, Filter } from "lucide-react-native";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import { useAppDependencies } from "@/core/di/AppDependencies";
import type { ModelProvider, RunStatus, Option, FilterChip } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

const FILTER_SCROLL_PROPS = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { flexDirection: "row", alignItems: "center", gap: spacing[8] } as const,
} as const;

const CHIP_SCROLL_PROPS = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: { flexDirection: "row", gap: spacing[6], paddingVertical: spacing[32] } as const,
} as const;

const PROVIDER_VALUES: ModelProvider[] = ["codex", "claude", "other"];

const STATUS_VALUES: RunStatus[] = ["succeeded", "failed", "running", "queued", "canceled"];

type FilterCategory = "team" | "project" | "provider" | "status";

interface FilterCategoryConfig {
  category: FilterCategory;
  singularLabel: string;
  pluralLabel: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}

interface FilterBarProps {
  visibleFilters?: FilterCategory[];
}

export const FilterBar = React.memo(function FilterBar({ visibleFilters }: FilterBarProps) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const {
    filters,
    setTeamFilter,
    setProjectFilter,
    setProviderFilter,
    setStatusFilter,
    clearAll,
    activeFilterCount,
  } = useDashboardFilters();

  const { seedData } = useAppDependencies();
  const [openDropdown, setOpenDropdown] = useState<FilterCategory | null>(null);

  const closeDropdown = useCallback(() => setOpenDropdown(null), []);

  const providerOptions: Option<ModelProvider>[] = useMemo(
    () => PROVIDER_VALUES.map((v) => ({ label: t(`filters.providers.${v}`), value: v })),
    [t],
  );

  const statusOptions: Option<RunStatus>[] = useMemo(
    () => STATUS_VALUES.map((v) => ({ label: t(`filters.statuses.${v}`), value: v })),
    [t],
  );

  const showFilter = useCallback(
    (cat: FilterCategory) => !visibleFilters || visibleFilters.includes(cat),
    [visibleFilters],
  );

  const teamOptions = useMemo(
    () => seedData.teams.map((t) => ({ label: t.name, value: t.id })),
    [seedData.teams],
  );

  const projectOptions = useMemo(
    () =>
      seedData.projects
        .slice(0, 20)
        .map((p) => ({ label: p.name, value: p.id })),
    [seedData.projects],
  );

  const toggleArrayValue = useCallback(
    (
      value: string,
      currentValues: string[] | undefined,
      setter: (vals: string[] | undefined) => void,
    ) => {
      const current = currentValues ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setter(next.length ? next : undefined);
    },
    [],
  );

  const filterConfigs: FilterCategoryConfig[] = useMemo(
    () => [
      {
        category: "team",
        singularLabel: t("filters.team"),
        pluralLabel: t("filters.teams"),
        options: teamOptions,
        selected: filters.teamIds ?? [],
        onToggle: (v) => toggleArrayValue(v, filters.teamIds, setTeamFilter),
      },
      {
        category: "project",
        singularLabel: t("filters.project"),
        pluralLabel: t("filters.projects"),
        options: projectOptions,
        selected: filters.projectIds ?? [],
        onToggle: (v) => toggleArrayValue(v, filters.projectIds, setProjectFilter),
      },
      {
        category: "provider",
        singularLabel: t("filters.provider"),
        pluralLabel: t("filters.providersLabel"),
        options: providerOptions,
        selected: filters.providers ?? [],
        onToggle: (v) =>
          toggleArrayValue(
            v,
            filters.providers,
            setProviderFilter as (vals: string[] | undefined) => void,
          ),
      },
      {
        category: "status",
        singularLabel: t("filters.status"),
        pluralLabel: t("filters.statusesLabel"),
        options: statusOptions,
        selected: filters.statuses ?? [],
        onToggle: (v) =>
          toggleArrayValue(
            v,
            filters.statuses,
            setStatusFilter as (vals: string[] | undefined) => void,
          ),
      },
    ],
    [
      t,
      teamOptions,
      projectOptions,
      providerOptions,
      statusOptions,
      filters,
      toggleArrayValue,
      setTeamFilter,
      setProjectFilter,
      setProviderFilter,
      setStatusFilter,
    ],
  );

  const activeChips = useMemo(() => {
    const chips: FilterChip[] = [];
    for (const config of filterConfigs) {
      if (!showFilter(config.category)) continue;
      for (const selectedValue of config.selected) {
        const option = config.options.find((o) => o.value === selectedValue);
        chips.push({
          key: `${config.category}-${selectedValue}`,
          label: option?.label ?? selectedValue,
          onRemove: () => config.onToggle(selectedValue),
        });
      }
    }
    return chips;
  }, [filterConfigs, showFilter]);

  const openConfig = filterConfigs.find((c) => c.category === openDropdown);

  return (
    <View style={styles.container}>
      {/* Row 1: Filter dropdowns */}
      <View style={styles.topRow}>
        <CustomList scrollViewProps={FILTER_SCROLL_PROPS}>
          <Filter size={14} color={theme.text.tertiary} style={styles.filterIcon} />
          {filterConfigs.map((config) => {
            if (!showFilter(config.category)) return null;
            const count = config.selected.length;
            const isActive = count > 0;
            return (
              <CustomButton
                key={config.category}
                style={[
                  styles.filterButton,
                  { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
                  isActive && { borderColor: theme.border.brand, backgroundColor: theme.bg.brandSubtle },
                ]}
                onPress={() =>
                  setOpenDropdown((prev) =>
                    prev === config.category ? null : config.category,
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={t("filters.filterBy", { category: config.singularLabel.toLowerCase() })}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    { color: theme.text.tertiary },
                    isActive && { color: theme.text.brand },
                  ]}
                >
                  {count > 0
                    ? `${config.pluralLabel} (${count})`
                    : config.singularLabel}
                </Text>
                <ChevronDown size={12} color={theme.text.tertiary} />
              </CustomButton>
            );
          })}
        </CustomList>
      </View>

      {/* Row 2: Active filter chips */}
      {activeChips.length > 0 && (
        <CustomList scrollViewProps={CHIP_SCROLL_PROPS}>
          {activeChips.map((chip) => (
            <View key={chip.key} style={[styles.chip, { backgroundColor: theme.bg.surfaceElevated, borderColor: theme.border.default }]}>
              <Text style={[styles.chipText, { color: theme.text.primary }]}>{chip.label}</Text>
              <CustomButton onPress={chip.onRemove} hitSlop={8}>
                <X size={12} color={theme.text.secondary} />
              </CustomButton>
            </View>
          ))}
          {activeFilterCount > 0 && (
            <CustomButton onPress={clearAll} style={styles.clearAllButton}>
              <Text style={[styles.clearAllText, { color: theme.border.brand }]}>{t("common.clearAll")}</Text>
            </CustomButton>
          )}
        </CustomList>
      )}

      {/* Dropdown Modal */}
      {openConfig && (
        <CustomModal
          visible
          onClose={closeDropdown}
          accessibilityLabel={t("filters.closeDropdown")}
          showCloseButton={false}
          panelWidth={300}
          panelStyle={styles.dropdownPanel}
        >
          <View style={[styles.dropdownHeader, { borderBottomColor: theme.border.default }]}>
            <Text style={[styles.dropdownTitle, { color: theme.text.primary }]}>
              {openConfig.singularLabel}
            </Text>
            <CustomButton onPress={closeDropdown} hitSlop={8}>
              <X size={16} color={theme.text.secondary} />
            </CustomButton>
          </View>
          <CustomList scrollViewProps={{ style: styles.optionsList, bounces: false }}>
            {openConfig.options.map((opt) => {
              const isSelected = openConfig.selected.includes(opt.value);
              return (
                <CustomButton
                  key={opt.value}
                  style={[
                    styles.optionRow,
                    isSelected && { backgroundColor: theme.bg.brandSubtle },
                  ]}
                  onPress={() => openConfig.onToggle(opt.value)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      { borderColor: theme.border.strong },
                      isSelected && { borderColor: theme.border.brand, backgroundColor: theme.border.brand },
                    ]}
                  >
                    {isSelected && <Text style={[styles.checkmark, { color: theme.text.onBrand }]}>&#10003;</Text>}
                  </View>
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: theme.text.secondary },
                      isSelected && { color: theme.text.primary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </CustomButton>
              );
            })}
          </CustomList>
        </CustomModal>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing[8],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  filterIcon: {
    marginRight: spacing[2],
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingHorizontal: spacing[10],
    paddingVertical: spacing[6],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: "row",
    gap: spacing[6],
    paddingVertical: spacing[2],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[6],
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  clearAllButton: {
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    justifyContent: "center",
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: "500",
  },
  dropdownPanel: {
    maxHeight: 400,
    padding: 0,
    gap: 0,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    borderBottomWidth: 1,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionsList: {
    maxHeight: 340,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[10],
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[10],
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 11,
    fontWeight: "700",
  },
  optionLabel: {
    fontSize: 13,
  },
});
