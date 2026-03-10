import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "expo-router";
import { Check } from "lucide-react-native";
import { useRuleDetailScreen } from "@/features/search/hooks";
import { useUpdateRuleMutation } from "@/store/api";
import { LoadingSkeleton, ErrorState, SectionHeader, StatusBadge } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { sectionStyles } from "@/components/screen";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import { cellText } from "@/components/tables/cellStyles";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs/CustomTextInput";
import { CustomSpinner } from "@/components/feedback/CustomSpinner";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius, borderWidth } from "@/theme/tokens";
import { buildEntityRoute, resolveTabFromPathname } from "@/constants/routes";
import type { PolicyViolationRow, RunListRow } from "@/features/analytics/types";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { keyExtractors } from "@/constants";

interface RuleDetailScreenProps {
  ruleId: string;
}

export function RuleDetailScreen({ ruleId }: RuleDetailScreenProps) {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useRuleDetailScreen(ruleId);
  const [updateRule] = useUpdateRuleMutation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();
  const router = useRouter();
  const pathname = usePathname();

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [agentFilter, setAgentFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  // Sync draft state when data loads or changes
  useEffect(() => {
    if (data) {
      setDraftTitle(data.rule.title);
      setDraftDescription(data.rule.description);
      setSelectedAgentIds(new Set(data.assignedAgentIds));
      setSelectedProjectIds(new Set(data.assignedProjectIds));
    }
  }, [data]);

  const navigateTo = useCallback(
    (entityType: "agent" | "project" | "team" | "human" | "run" | "rule", entityId: string) => {
      const tab = resolveTabFromPathname(pathname);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [pathname, router],
  );

  const handleEditPress = useCallback(() => {
    if (data) {
      setDraftTitle(data.rule.title);
      setDraftDescription(data.rule.description);
      setSelectedAgentIds(new Set(data.assignedAgentIds));
      setSelectedProjectIds(new Set(data.assignedProjectIds));
    }
    setIsEditing(true);
  }, [data]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setAgentFilter("");
    setProjectFilter("");
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateRule({
        ruleId,
        title: draftTitle,
        description: draftDescription,
        assignedAgentIds: Array.from(selectedAgentIds),
        assignedProjectIds: Array.from(selectedProjectIds),
      }).unwrap();
      setIsEditing(false);
      setAgentFilter("");
      setProjectFilter("");
    } finally {
      setSaving(false);
    }
  }, [ruleId, draftTitle, draftDescription, selectedAgentIds, selectedProjectIds, updateRule]);

  const toggleAgent = useCallback((agentId: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  }, []);

  const toggleProject = useCallback((projectId: string) => {
    setSelectedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  const filteredAgents = useMemo(() => {
    if (!data) return [];
    if (!agentFilter.trim()) return data.allAgents;
    const q = agentFilter.trim().toLowerCase();
    return data.allAgents.filter((a) => a.name.toLowerCase().includes(q));
  }, [data, agentFilter]);

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    if (!projectFilter.trim()) return data.allProjects;
    const q = projectFilter.trim().toLowerCase();
    return data.allProjects.filter((p) => p.name.toLowerCase().includes(q));
  }, [data, projectFilter]);

  const violationCols = useMemo<ColumnDef<PolicyViolationRow>[]>(() => [
    { key: "timestampIso", header: t("governance.table.time"), width: 160, render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text> },
    {
      key: "agentName", header: t("governance.table.agent"), width: 140, render: (row) => (
        <CustomButton onPress={() => navigateTo("agent", row.agentId)} accessibilityRole="link" accessibilityLabel={`View agent ${row.agentName}`}>
          <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
        </CustomButton>
      )
    },
    { key: "reason", header: t("governance.table.reason"), width: 180 },
    { key: "severity", header: t("governance.table.severity"), width: 90, render: (row) => <StatusBadge variant="severity" severity={row.severity} /> },
  ], [ct, navigateTo, t]);

  const runCols = useMemo<ColumnDef<RunListRow>[]>(() => [
    {
      key: "id", header: t("entityDetail.table.runId"), width: 140, render: (r) => (
        <CustomButton onPress={() => navigateTo("run", r.id)} accessibilityRole="link" accessibilityLabel={`View run ${r.id}`}>
          <Text style={ct.link} numberOfLines={1}>{r.id.slice(0, 12)}</Text>
        </CustomButton>
      ),
    },
    {
      key: "status",
      header: t("entityDetail.table.status"),
      width: 100,
      render: (r) => <StatusBadge variant="run-status" status={r.status} />,
    },
    { key: "startedAtIso", header: t("entityDetail.table.created"), width: 160, render: (r) => <Text style={ct.secondary}>{new Date(r.startedAtIso).toLocaleString()}</Text> },
    { key: "provider", header: t("entityDetail.table.provider"), width: 100, render: (r) => <Text style={ct.secondary}>{r.provider}</Text> },
    {
      key: "durationMs",
      header: t("entityDetail.table.duration"),
      width: 90,
      align: "right",
      render: (r) => <Text style={ct.primary}>{(r.durationMs / 1000).toFixed(1)}s</Text>,
      sortAccessor: (r) => r.durationMs,
    },
    {
      key: "costUsd",
      header: t("entityDetail.table.cost"),
      width: 80,
      align: "right",
      render: (r) => <Text style={ct.primary}>{formatCurrency(r.costUsd)}</Text>,
      sortAccessor: (r) => r.costUsd,
    },
  ], [ct, navigateTo, t, formatCurrency]);

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const { rule } = data;

  return (
    <ScreenWrapper headerProps={{ title: "Rule", subtitle: "Customize your Guardrails" }} showFilterBar={false}>
      <View style={styles.content}>
        {/* ── Rule Details Section ──────────────────────── */}
        <View style={[styles.editSection, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Rule Details</Text>
            {!isEditing && (
              <CustomButton onPress={handleEditPress} accessibilityLabel="Edit rule">
                <Text style={[styles.editButton, { color: theme.border.brand }]}>{t("common.edit")}</Text>
              </CustomButton>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editArea}>
              <CustomTextInput
                label="Title"
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder="Rule title"
                accessibilityLabel="Rule title"
              />
              <CustomTextInput
                label="Description"
                value={draftDescription}
                onChangeText={setDraftDescription}
                multiline
                numberOfLines={3}
                placeholder="Rule description"
                style={styles.descriptionInput}
                inputContainerStyle={styles.descriptionInputContainer}
                accessibilityLabel="Rule description"
              />
            </View>
          ) : (
            <View style={styles.readOnlyFields}>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Title</Text>
                <Text style={[styles.fieldValue, { color: theme.text.primary }]}>{rule.title}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Description</Text>
                <Text style={[styles.fieldValue, { color: theme.text.primary }]}>{rule.description}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Created</Text>
                <Text style={[styles.fieldValue, { color: theme.text.primary }]}>{new Date(rule.createdAtIso).toLocaleString()}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Last Edited</Text>
                <Text style={[styles.fieldValue, { color: theme.text.primary }]}>{new Date(rule.editedAtIso).toLocaleString()}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Runs Checked</Text>
                <Text style={[styles.fieldValue, { color: theme.text.primary }]}>{rule.runsCheckedCount.toLocaleString()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Assigned Agents Section ──────────────────── */}
        <View style={[styles.editSection, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}>
          <SectionHeader
            title={`Assigned Agents (${isEditing ? selectedAgentIds.size : data.assignedAgentIds.length})`}
            subtitle="Agents that must abide by this rule"
          />
          {isEditing ? (
            <View style={styles.selectionList}>
              <CustomTextInput
                containerStyle={styles.filterInputContainer}
                style={styles.filterInput}
                placeholder="Filter agents..."
                value={agentFilter}
                onChangeText={setAgentFilter}
                accessibilityLabel="Filter agents"
              />
              {filteredAgents.map((agent) => (
                <SelectableRow
                  key={agent.id}
                  label={agent.name}
                  sublabel={agent.description}
                  isSelected={selectedAgentIds.has(agent.id)}
                  onPress={() => toggleAgent(agent.id)}
                  theme={theme}
                />
              ))}
            </View>
          ) : (
            <View style={styles.chipList}>
              {data.allAgents
                .filter((a) => data.assignedAgentIds.includes(a.id))
                .map((agent) => (
                  <CustomButton key={agent.id} onPress={() => navigateTo("agent", agent.id)} accessibilityRole="link" accessibilityLabel={`View agent ${agent.name}`}>
                    <View style={[styles.chip, { backgroundColor: theme.bg.brandSubtle, borderColor: theme.border.brand }]}>
                      <Text style={[styles.chipText, { color: theme.text.brand }]}>{agent.name}</Text>
                    </View>
                  </CustomButton>
                ))}
              {data.assignedAgentIds.length === 0 && (
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No agents assigned</Text>
              )}
            </View>
          )}
        </View>

        {/* ── Assigned Projects Section ────────────────── */}
        <View style={[styles.editSection, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }]}>
          <SectionHeader
            title={`Assigned Projects (${isEditing ? selectedProjectIds.size : data.assignedProjectIds.length})`}
            subtitle="Projects that must abide by this rule"
          />
          {isEditing ? (
            <View style={styles.selectionList}>
              <CustomTextInput
                containerStyle={styles.filterInputContainer}
                style={styles.filterInput}
                placeholder="Filter projects..."
                value={projectFilter}
                onChangeText={setProjectFilter}
                accessibilityLabel="Filter projects"
              />
              {filteredProjects.map((project) => (
                <SelectableRow
                  key={project.id}
                  label={project.name}
                  isSelected={selectedProjectIds.has(project.id)}
                  onPress={() => toggleProject(project.id)}
                  theme={theme}
                />
              ))}
            </View>
          ) : (
            <View style={styles.chipList}>
              {data.allProjects
                .filter((p) => data.assignedProjectIds.includes(p.id))
                .map((project) => (
                  <CustomButton key={project.id} onPress={() => navigateTo("project", project.id)} accessibilityRole="link" accessibilityLabel={`View project ${project.name}`}>
                    <View style={[styles.chip, { backgroundColor: theme.bg.brandSubtle, borderColor: theme.border.brand }]}>
                      <Text style={[styles.chipText, { color: theme.text.brand }]}>{project.name}</Text>
                    </View>
                  </CustomButton>
                ))}
              {data.assignedProjectIds.length === 0 && (
                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No projects assigned</Text>
              )}
            </View>
          )}
        </View>

        {/* ── Save / Cancel bar ────────────────────────── */}
        {isEditing && (
          <View style={styles.actionBar}>
            <CustomButton onPress={handleCancelEdit} accessibilityLabel="Cancel editing">
              <Text style={[styles.actionButton, { color: theme.text.secondary }]}>{t("common.cancel")}</Text>
            </CustomButton>
            <CustomButton onPress={handleSave} accessibilityLabel="Save rule">
              <View style={[styles.saveButton, { backgroundColor: theme.border.brand }]}>
                {saving ? (
                  <CustomSpinner size={14} color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t("common.save")}</Text>
                )}
              </View>
            </CustomButton>
          </View>
        )}

        {/* ── Recent Violations ────────────────────────── */}
        {data.recentViolations.length > 0 && (
          <View style={sectionStyles.section}>
            <SectionHeader title="Recent Violations" subtitle="Violations triggered by this rule" />
            <DataTable
              columns={violationCols}
              data={data.recentViolations}
              keyExtractor={keyExtractors.byId}
            />
          </View>
        )}

        {/* ── Recent Runs ──────────────────────────────── */}
        {data.recentRuns.length > 0 && (
          <View style={sectionStyles.section}>
            <SectionHeader title="Recent Runs" subtitle="Runs checked against this rule" />
            <DataTable
              columns={runCols}
              data={data.recentRuns}
              keyExtractor={keyExtractors.byId}
              initialSortBy="startedAtIso"
              initialSortDirection="desc"
            />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

// ── Selectable Row ────────────────────────────────────────

type ThemeColors = (typeof semanticThemes)["dark"];

function SelectableRow({
  label,
  sublabel,
  isSelected,
  onPress,
  theme,
}: {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onPress: () => void;
  theme: ThemeColors;
}) {
  return (
    <CustomButton
      onPress={onPress}
      style={[
        styles.selectableRow,
        { borderColor: theme.border.default },
        isSelected && { borderColor: theme.border.brand, backgroundColor: theme.bg.brandSubtle },
      ]}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: isSelected }}
    >
      <View style={styles.selectableLabelCol}>
        <Text
          style={[styles.selectableLabel, { color: theme.text.primary }, isSelected && { color: theme.text.brand }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.selectableSublabel, { color: theme.text.tertiary }]} numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {isSelected && <Check size={18} color={theme.text.brand} />}
    </CustomButton>
  );
}

// ── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  content: { gap: spacing[16] },
  editSection: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    padding: spacing[16],
    gap: spacing[12],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  editButton: { fontSize: 13, fontWeight: "600" },
  editArea: { gap: spacing[12] },
  descriptionInput: { fontSize: 14, lineHeight: 20, minHeight: 60, width: "100%", flexGrow: 1, textAlignVertical: "top" },
  descriptionInputContainer: { minHeight: 60, alignItems: "stretch", paddingVertical: spacing[8] },
  readOnlyFields: { gap: spacing[8] },
  fieldRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing[8] },
  fieldLabel: { fontSize: 13, fontWeight: "500", minWidth: 100 },
  fieldValue: { fontSize: 14, flex: 1, textAlign: "right" },
  selectionList: { gap: spacing[8] },
  filterInputContainer: { minHeight: 0 },
  filterInput: { fontSize: 13 },
  selectableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[10],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  selectableLabelCol: { flex: 1, gap: spacing[2] },
  selectableLabel: { fontSize: 14, fontWeight: "600" },
  selectableSublabel: { fontSize: 12 },
  chipList: { flexDirection: "row", flexWrap: "wrap", gap: spacing[8] },
  chip: {
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[4],
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
  emptyText: { fontSize: 13, fontStyle: "italic" },
  actionBar: { flexDirection: "row", justifyContent: "flex-end", gap: spacing[8] },
  actionButton: { fontSize: 13, fontWeight: "600", paddingVertical: spacing[4] },
  saveButton: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[4],
    minWidth: 56,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
