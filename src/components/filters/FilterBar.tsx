import React, { useState, useCallback, useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from "react-native";
import { ChevronDown, X, Filter } from "lucide-react-native";
import { useDashboardFilters } from "@/features/analytics/hooks/useDashboardFilters";
import { useAppDependencies } from "@/core/di/AppDependencies";
import type { ModelProvider, RunStatus } from "@/features/analytics/types";

const PROVIDER_OPTIONS: { label: string; value: ModelProvider }[] = [
  { label: "Codex", value: "codex" },
  { label: "Claude", value: "claude" },
  { label: "Other", value: "other" },
];

const STATUS_OPTIONS: { label: string; value: RunStatus }[] = [
  { label: "Succeeded", value: "succeeded" },
  { label: "Failed", value: "failed" },
  { label: "Running", value: "running" },
  { label: "Queued", value: "queued" },
  { label: "Canceled", value: "canceled" },
];

type FilterCategory = "team" | "project" | "provider" | "status";

interface FilterBarProps {
  /** Which filter categories to show. Defaults to all. */
  visibleFilters?: FilterCategory[];
}

export function FilterBar({ visibleFilters }: FilterBarProps) {
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
    [visibleFilters]
  );

  const teamOptions = useMemo(
    () => seedData.teams.map((t) => ({ label: t.name, value: t.id })),
    [seedData.teams]
  );

  const projectOptions = useMemo(
    () =>
      seedData.projects
        .slice(0, 20)
        .map((p) => ({ label: p.name, value: p.id })),
    [seedData.projects]
  );

  // Build active filter chip data
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (filters.teamIds?.length) {
      for (const tid of filters.teamIds) {
        const team = seedData.teams.find((t) => t.id === tid);
        chips.push({
          key: `team-${tid}`,
          label: team?.name ?? tid,
          onRemove: () => {
            const next = filters.teamIds?.filter((id) => id !== tid);
            setTeamFilter(next?.length ? next : undefined);
          },
        });
      }
    }
    if (filters.projectIds?.length) {
      for (const pid of filters.projectIds) {
        const proj = seedData.projects.find((p) => p.id === pid);
        chips.push({
          key: `proj-${pid}`,
          label: proj?.name ?? pid,
          onRemove: () => {
            const next = filters.projectIds?.filter((id) => id !== pid);
            setProjectFilter(next?.length ? next : undefined);
          },
        });
      }
    }
    if (filters.providers?.length) {
      for (const prov of filters.providers) {
        chips.push({
          key: `prov-${prov}`,
          label: PROVIDER_OPTIONS.find((o) => o.value === prov)?.label ?? prov,
          onRemove: () => {
            const next = filters.providers?.filter((p) => p !== prov);
            setProviderFilter(next?.length ? next : undefined);
          },
        });
      }
    }
    if (filters.statuses?.length) {
      for (const st of filters.statuses) {
        chips.push({
          key: `status-${st}`,
          label: STATUS_OPTIONS.find((o) => o.value === st)?.label ?? st,
          onRemove: () => {
            const next = filters.statuses?.filter((s) => s !== st);
            setStatusFilter(next?.length ? next : undefined);
          },
        });
      }
    }
    return chips;
  }, [filters, seedData, setTeamFilter, setProjectFilter, setProviderFilter, setStatusFilter]);

  const handleToggleItem = useCallback(
    (
      category: FilterCategory,
      value: string,
      currentValues: string[] | undefined,
      setter: (vals: string[] | undefined) => void
    ) => {
      const current = currentValues ?? [];
      const isSelected = current.includes(value);
      const next = isSelected
        ? current.filter((v) => v !== value)
        : [...current, value];
      setter(next.length ? next : undefined);
    },
    []
  );

  const renderDropdownContent = useCallback(() => {
    if (!openDropdown) return null;

    let options: { label: string; value: string }[] = [];
    let selected: string[] = [];
    let onToggle: (value: string) => void = () => {};

    switch (openDropdown) {
      case "team":
        options = teamOptions;
        selected = filters.teamIds ?? [];
        onToggle = (v) =>
          handleToggleItem("team", v, filters.teamIds, setTeamFilter);
        break;
      case "project":
        options = projectOptions;
        selected = filters.projectIds ?? [];
        onToggle = (v) =>
          handleToggleItem("project", v, filters.projectIds, setProjectFilter);
        break;
      case "provider":
        options = PROVIDER_OPTIONS;
        selected = filters.providers ?? [];
        onToggle = (v) =>
          handleToggleItem(
            "provider",
            v,
            filters.providers,
            setProviderFilter as (vals: string[] | undefined) => void
          );
        break;
      case "status":
        options = STATUS_OPTIONS;
        selected = filters.statuses ?? [];
        onToggle = (v) =>
          handleToggleItem(
            "status",
            v,
            filters.statuses,
            setStatusFilter as (vals: string[] | undefined) => void
          );
        break;
    }

    return (
      <Modal
        transparent
        animationType="fade"
        visible
        onRequestClose={() => setOpenDropdown(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpenDropdown(null)}>
          <View style={styles.dropdownPanel}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                {openDropdown.charAt(0).toUpperCase() + openDropdown.slice(1)}
              </Text>
              <Pressable onPress={() => setOpenDropdown(null)} hitSlop={8}>
                <X size={16} color="#a3a3a3" />
              </Pressable>
            </View>
            <ScrollView style={styles.optionsList} bounces={false}>
              {options.map((opt) => {
                const isSelected = selected.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    onPress={() => onToggle(opt.value)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxSelected,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
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
    );
  }, [
    openDropdown,
    teamOptions,
    projectOptions,
    filters,
    handleToggleItem,
    setTeamFilter,
    setProjectFilter,
    setProviderFilter,
    setStatusFilter,
  ]);

  const filterButtonLabel = useCallback(
    (category: FilterCategory): string => {
      switch (category) {
        case "team": {
          const count = filters.teamIds?.length ?? 0;
          return count ? `Teams (${count})` : "Team";
        }
        case "project": {
          const count = filters.projectIds?.length ?? 0;
          return count ? `Projects (${count})` : "Project";
        }
        case "provider": {
          const count = filters.providers?.length ?? 0;
          return count ? `Providers (${count})` : "Provider";
        }
        case "status": {
          const count = filters.statuses?.length ?? 0;
          return count ? `Statuses (${count})` : "Status";
        }
      }
    },
    [filters]
  );

  return (
    <View style={styles.container}>
      {/* Row 1: Filter dropdowns */}
      <View style={styles.topRow}>
        {/* Filter Dropdowns */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterGroup}
        >
          <Filter size={14} color="#8a8a8a" style={styles.filterIcon} />
          {showFilter("team") && (
            <Pressable
              style={[
                styles.filterButton,
                (filters.teamIds?.length ?? 0) > 0 && styles.filterButtonActive,
              ]}
              onPress={() =>
                setOpenDropdown((prev) => (prev === "team" ? null : "team"))
              }
              accessibilityRole="button"
              accessibilityLabel="Filter by team"
            >
              <Text
                style={[
                  styles.filterButtonText,
                  (filters.teamIds?.length ?? 0) > 0 && styles.filterButtonTextActive,
                ]}
              >
                {filterButtonLabel("team")}
              </Text>
              <ChevronDown size={12} color="#8a8a8a" />
            </Pressable>
          )}
          {showFilter("project") && (
            <Pressable
              style={[
                styles.filterButton,
                (filters.projectIds?.length ?? 0) > 0 && styles.filterButtonActive,
              ]}
              onPress={() =>
                setOpenDropdown((prev) =>
                  prev === "project" ? null : "project"
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Filter by project"
            >
              <Text
                style={[
                  styles.filterButtonText,
                  (filters.projectIds?.length ?? 0) > 0 && styles.filterButtonTextActive,
                ]}
              >
                {filterButtonLabel("project")}
              </Text>
              <ChevronDown size={12} color="#8a8a8a" />
            </Pressable>
          )}
          {showFilter("provider") && (
            <Pressable
              style={[
                styles.filterButton,
                (filters.providers?.length ?? 0) > 0 && styles.filterButtonActive,
              ]}
              onPress={() =>
                setOpenDropdown((prev) =>
                  prev === "provider" ? null : "provider"
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Filter by provider"
            >
              <Text
                style={[
                  styles.filterButtonText,
                  (filters.providers?.length ?? 0) > 0 && styles.filterButtonTextActive,
                ]}
              >
                {filterButtonLabel("provider")}
              </Text>
              <ChevronDown size={12} color="#8a8a8a" />
            </Pressable>
          )}
          {showFilter("status") && (
            <Pressable
              style={[
                styles.filterButton,
                (filters.statuses?.length ?? 0) > 0 && styles.filterButtonActive,
              ]}
              onPress={() =>
                setOpenDropdown((prev) =>
                  prev === "status" ? null : "status"
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Filter by status"
            >
              <Text
                style={[
                  styles.filterButtonText,
                  (filters.statuses?.length ?? 0) > 0 && styles.filterButtonTextActive,
                ]}
              >
                {filterButtonLabel("status")}
              </Text>
              <ChevronDown size={12} color="#8a8a8a" />
            </Pressable>
          )}
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
            <View key={chip.key} style={styles.chip}>
              <Text style={styles.chipText}>{chip.label}</Text>
              <Pressable onPress={chip.onRemove} hitSlop={8}>
                <X size={12} color="#a3a3a3" />
              </Pressable>
            </View>
          ))}
          {activeFilterCount > 0 && (
            <Pressable onPress={clearAll} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* Dropdown Modal */}
      {renderDropdownContent()}
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
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },
  filterButtonActive: {
    borderColor: "#30a8dc",
    backgroundColor: "rgba(48, 168, 220, 0.1)",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#8a8a8a",
  },
  filterButtonTextActive: {
    color: "#67c4ea",
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
    backgroundColor: "#262626",
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },
  chipText: {
    fontSize: 11,
    color: "#e5e5e5",
  },
  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  clearAllText: {
    fontSize: 11,
    color: "#30a8dc",
    fontWeight: "500",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownPanel: {
    width: 300,
    maxHeight: 400,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2d2d2d",
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d2d",
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e5e5",
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
  optionRowSelected: {
    backgroundColor: "rgba(48, 168, 220, 0.08)",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#30a8dc",
    backgroundColor: "#30a8dc",
  },
  checkmark: {
    fontSize: 11,
    color: "#ffffff",
    fontWeight: "700",
  },
  optionLabel: {
    fontSize: 13,
    color: "#a3a3a3",
  },
  optionLabelSelected: {
    color: "#e5e5e5",
  },
});
