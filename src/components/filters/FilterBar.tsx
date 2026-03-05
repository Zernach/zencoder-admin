import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from "react-native";
import { ChevronDown, X, Filter } from "lucide-react-native";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import { useAppDependencies } from "@/core/di/AppDependencies";
import type { ModelProvider, RunStatus, Option, FilterChip } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

const PROVIDER_OPTIONS: Option<ModelProvider>[] = [
  { label: "Codex", value: "codex" },
  { label: "Claude", value: "claude" },
  { label: "Other", value: "other" },
];

const STATUS_OPTIONS: Option<RunStatus>[] = [
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  { label: "Running", value: "running" },
  { label: "Queued", value: "queued" },
  { label: "Canceled", value: "canceled" },
];

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

export function FilterBar({ visibleFilters }: FilterBarProps) {
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
        singularLabel: "Team",
        pluralLabel: "Teams",
        options: teamOptions,
        selected: filters.teamIds ?? [],
        onToggle: (v) => toggleArrayValue(v, filters.teamIds, setTeamFilter),
      },
      {
        category: "project",
        singularLabel: "Project",
        pluralLabel: "Projects",
        options: projectOptions,
        selected: filters.projectIds ?? [],
        onToggle: (v) => toggleArrayValue(v, filters.projectIds, setProjectFilter),
      },
      {
        category: "provider",
        singularLabel: "Provider",
        pluralLabel: "Providers",
        options: PROVIDER_OPTIONS,
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
        singularLabel: "Status",
        pluralLabel: "Statuses",
        options: STATUS_OPTIONS,
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
      teamOptions,
      projectOptions,
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterGroup}
        >
          <Filter size={14} color={theme.text.tertiary} style={styles.filterIcon} />
          {filterConfigs.map((config) => {
            if (!showFilter(config.category)) return null;
            const count = config.selected.length;
            const isActive = count > 0;
            return (
              <Pressable
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
                accessibilityLabel={`Filter by ${config.singularLabel.toLowerCase()}`}
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
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Row 2: Active filter chips */}
      {activeChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {activeChips.map((chip) => (
            <View key={chip.key} style={[styles.chip, { backgroundColor: theme.bg.surfaceElevated, borderColor: theme.border.default }]}>
              <Text style={[styles.chipText, { color: theme.text.primary }]}>{chip.label}</Text>
              <Pressable onPress={chip.onRemove} hitSlop={8}>
                <X size={12} color={theme.text.secondary} />
              </Pressable>
            </View>
          ))}
          {activeFilterCount > 0 && (
            <Pressable onPress={clearAll} style={styles.clearAllButton}>
              <Text style={[styles.clearAllText, { color: theme.border.brand }]}>Clear All</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* Dropdown Modal */}
      {openConfig && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setOpenDropdown(null)}
        >
          <Pressable style={[styles.modalOverlay, { backgroundColor: theme.bg.overlay }]} onPress={() => setOpenDropdown(null)}>
            <View style={[styles.dropdownPanel, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}>
              <View style={[styles.dropdownHeader, { borderBottomColor: theme.border.default }]}>
                <Text style={[styles.dropdownTitle, { color: theme.text.primary }]}>
                  {openConfig.singularLabel}
                </Text>
                <Pressable onPress={() => setOpenDropdown(null)} hitSlop={8}>
                  <X size={16} color={theme.text.secondary} />
                </Pressable>
              </View>
              <ScrollView style={styles.optionsList} bounces={false}>
                {openConfig.options.map((opt) => {
                  const isSelected = openConfig.selected.includes(opt.value);
                  return (
                    <Pressable
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
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterIcon: {
    marginRight: 2,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
  },
  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownPanel: {
    width: 300,
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
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
