import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "expo-router";
import { Check } from "lucide-react-native";
import { useRuleDetailScreen } from "@/features/search/hooks";
import { useUpdateRuleMutation } from "@/store/api";
import { LoadingSkeleton, ErrorState, SectionHeader, StatusBadge } from "@/components/dashboard";
import { ScreenWrapper, sectionStyles } from "@/components/screen";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import { cellText } from "@/components/tables/cellStyles";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs/CustomTextInput";
import { CustomSpinner } from "@/components/feedback/CustomSpinner";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius, borderWidth } from "@/theme/tokens";
import { buildEntityRoute, resolveTabFromPathname, ROUTES } from "@/constants/routes";
import type {
  PolicyViolationRow,
  RunListRow,
  RuleDetailResponse,
} from "@/features/analytics/types";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { useAppSelector } from "@/store/hooks";
import { selectOrgId } from "@/store/slices/filtersSlice";
import { keyExtractors } from "@/constants";

interface RuleDetailScreenProps {
  ruleId: string;
}

type RuleEntityType = "agent" | "project" | "team" | "human" | "run" | "rule";
type RuleNavigateTo = (entityType: RuleEntityType, entityId: string) => void;

export function RuleDetailScreen({ ruleId }: RuleDetailScreenProps) {
  const { data, loading, error, refetch } = useRuleDetailScreen(ruleId);
  const router = useRouter();
  const pathname = usePathname();

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const navigateTo = useCallback<RuleNavigateTo>(
    (entityType, entityId) => {
      const tab = resolveTabFromPathname(pathnameRef.current);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [router],
  );

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={refetch}
        fullScreen
        showHomeButton
        onGoHome={() => router.replace(ROUTES.ROOT as never)}
      />
    );
  }
  if (!data) return null;

  return (
    <ScreenWrapper
      headerProps={{ title: "Rule", subtitle: "Customize your Guardrails" }}
      showFilterBar={false}
    >
      <View style={styles.content}>
        <RuleEditorSections
          ruleId={ruleId}
          data={data}
          navigateTo={navigateTo}
        />
        <RuleActivitySection data={data} navigateTo={navigateTo} />
      </View>
    </ScreenWrapper>
  );
}

const RuleEditorSections = React.memo(function RuleEditorSections({
  ruleId,
  data,
  navigateTo,
}: {
  ruleId: string;
  data: RuleDetailResponse;
  navigateTo: RuleNavigateTo;
}) {
  const { t } = useTranslation();
  const orgId = useAppSelector(selectOrgId);
  const [updateRule] = useUpdateRuleMutation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [agentFilter, setAgentFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const editSectionStyle = useMemo(
    () => [styles.editSection, { backgroundColor: theme.bg.surface, borderColor: theme.border.default }],
    [theme.bg.surface, theme.border.default],
  );
  const chipStyle = useMemo(
    () => [styles.chip, { backgroundColor: theme.bg.brandSubtle, borderColor: theme.border.brand }],
    [theme.bg.brandSubtle, theme.border.brand],
  );

  useEffect(() => {
    setDraftTitle(data.rule.title);
    setDraftDescription(data.rule.description);
    setSelectedAgentIds(new Set(data.assignedAgentIds));
    setSelectedProjectIds(new Set(data.assignedProjectIds));
  }, [data]);

  const filteredAgents = useMemo(() => {
    if (!agentFilter.trim()) return data.allAgents;
    const query = agentFilter.trim().toLowerCase();
    return data.allAgents.filter((agent) => agent.name.toLowerCase().includes(query));
  }, [data.allAgents, agentFilter]);

  const filteredProjects = useMemo(() => {
    if (!projectFilter.trim()) return data.allProjects;
    const query = projectFilter.trim().toLowerCase();
    return data.allProjects.filter((project) => project.name.toLowerCase().includes(query));
  }, [data.allProjects, projectFilter]);

  const handleEditPress = useCallback(() => {
    setDraftTitle(data.rule.title);
    setDraftDescription(data.rule.description);
    setSelectedAgentIds(new Set(data.assignedAgentIds));
    setSelectedProjectIds(new Set(data.assignedProjectIds));
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
        orgId,
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
  }, [ruleId, draftTitle, draftDescription, selectedAgentIds, selectedProjectIds, orgId, updateRule]);

  const toggleAgent = useCallback((agentId: string) => {
    setSelectedAgentIds((previous) => {
      const next = new Set(previous);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }, []);

  const toggleProject = useCallback((projectId: string) => {
    setSelectedProjectIds((previous) => {
      const next = new Set(previous);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }, []);

  return (
    <>
      <View
        style={editSectionStyle}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Rule Details</Text>
          {!isEditing && (
            <CustomButton onPress={handleEditPress} accessibilityLabel="Edit rule">
              <Text style={[styles.editButton, { color: theme.border.brand }]}>
                {t("common.edit")}
              </Text>
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
              <Text style={[styles.fieldValue, { color: theme.text.primary }]}>{data.rule.title}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Description</Text>
              <Text style={[styles.fieldValue, { color: theme.text.primary }]}>{data.rule.description}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Created</Text>
              <Text style={[styles.fieldValue, { color: theme.text.primary }]}>
                {new Date(data.rule.createdAtIso).toLocaleString()}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Last Edited</Text>
              <Text style={[styles.fieldValue, { color: theme.text.primary }]}>
                {new Date(data.rule.editedAtIso).toLocaleString()}
              </Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: theme.text.secondary }]}>Runs Checked</Text>
              <Text style={[styles.fieldValue, { color: theme.text.primary }]}>
                {data.rule.runsCheckedCount.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View
        style={editSectionStyle}
      >
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
                id={agent.id}
                label={agent.name}
                sublabel={agent.description}
                isSelected={selectedAgentIds.has(agent.id)}
                onToggle={toggleAgent}
                theme={theme}
              />
            ))}
          </View>
        ) : (
          <View style={styles.chipList}>
            {data.allAgents
              .filter((agent) => data.assignedAgentIds.includes(agent.id))
              .map((agent) => (
                <CustomButton
                  key={agent.id}
                  onPress={() => navigateTo("agent", agent.id)}
                  accessibilityRole="link"
                  accessibilityLabel={`View agent ${agent.name}`}
                >
                  <View style={chipStyle}>
                    <Text style={[styles.chipText, { color: theme.text.brand }]}>
                      {agent.name}
                    </Text>
                  </View>
                </CustomButton>
              ))}
            {data.assignedAgentIds.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No agents assigned</Text>
            )}
          </View>
        )}
      </View>

      <View
        style={editSectionStyle}
      >
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
                id={project.id}
                label={project.name}
                isSelected={selectedProjectIds.has(project.id)}
                onToggle={toggleProject}
                theme={theme}
              />
            ))}
          </View>
        ) : (
          <View style={styles.chipList}>
            {data.allProjects
              .filter((project) => data.assignedProjectIds.includes(project.id))
              .map((project) => (
                <CustomButton
                  key={project.id}
                  onPress={() => navigateTo("project", project.id)}
                  accessibilityRole="link"
                  accessibilityLabel={`View project ${project.name}`}
                >
                  <View style={chipStyle}>
                    <Text style={[styles.chipText, { color: theme.text.brand }]}>
                      {project.name}
                    </Text>
                  </View>
                </CustomButton>
              ))}
            {data.assignedProjectIds.length === 0 && (
              <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No projects assigned</Text>
            )}
          </View>
        )}
      </View>

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
    </>
  );
});

const RuleActivitySection = React.memo(function RuleActivitySection({
  data,
  navigateTo,
}: {
  data: RuleDetailResponse;
  navigateTo: RuleNavigateTo;
}) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();

  const violationCols = useMemo<ColumnDef<PolicyViolationRow>[]>(() => [
    {
      key: "timestampIso",
      header: t("governance.table.time"),
      width: 160,
      render: (row) => <Text style={ct.primary}>{new Date(row.timestampIso).toLocaleString()}</Text>,
    },
    {
      key: "agentName",
      header: t("governance.table.agent"),
      width: 140,
      render: (row) => (
        <CustomButton
          onPress={() => navigateTo("agent", row.agentId)}
          accessibilityRole="link"
          accessibilityLabel={`View agent ${row.agentName}`}
        >
          <Text style={ct.link} numberOfLines={1}>{row.agentName}</Text>
        </CustomButton>
      ),
    },
    { key: "reason", header: t("governance.table.reason"), width: 180 },
    {
      key: "severity",
      header: t("governance.table.severity"),
      width: 90,
      render: (row) => <StatusBadge variant="severity" severity={row.severity} />,
    },
  ], [ct, navigateTo, t]);

  const runCols = useMemo<ColumnDef<RunListRow>[]>(() => [
    {
      key: "id",
      header: t("entityDetail.table.runId"),
      width: 140,
      render: (row) => (
        <CustomButton
          onPress={() => navigateTo("run", row.id)}
          accessibilityRole="link"
          accessibilityLabel={`View run ${row.id}`}
        >
          <Text style={ct.link} numberOfLines={1}>{row.id.slice(0, 12)}</Text>
        </CustomButton>
      ),
    },
    {
      key: "status",
      header: t("entityDetail.table.status"),
      width: 100,
      render: (row) => <StatusBadge variant="run-status" status={row.status} />,
    },
    {
      key: "startedAtIso",
      header: t("entityDetail.table.created"),
      width: 160,
      render: (row) => <Text style={ct.secondary}>{new Date(row.startedAtIso).toLocaleString()}</Text>,
    },
    {
      key: "provider",
      header: t("entityDetail.table.provider"),
      width: 100,
      render: (row) => <Text style={ct.secondary}>{row.provider}</Text>,
    },
    {
      key: "durationMs",
      header: t("entityDetail.table.duration"),
      width: 90,
      align: "right",
      render: (row) => <Text style={ct.primary}>{(row.durationMs / 1000).toFixed(1)}s</Text>,
      sortAccessor: (row) => row.durationMs,
    },
    {
      key: "costUsd",
      header: t("entityDetail.table.cost"),
      width: 80,
      align: "right",
      render: (row) => <Text style={ct.primary}>{formatCurrency(row.costUsd)}</Text>,
      sortAccessor: (row) => row.costUsd,
    },
  ], [ct, navigateTo, t, formatCurrency]);

  return (
    <>
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
    </>
  );
});

type ThemeColors = (typeof semanticThemes)["dark"];

const SelectableRow = React.memo(function SelectableRow({
  id,
  label,
  sublabel,
  isSelected,
  onToggle,
  theme,
}: {
  id: string;
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  theme: ThemeColors;
}) {
  const handlePress = useCallback(() => onToggle(id), [onToggle, id]);

  return (
    <CustomButton
      onPress={handlePress}
      style={[
        styles.selectableRow,
        { borderColor: theme.border.default },
        isSelected && {
          borderColor: theme.border.brand,
          backgroundColor: theme.bg.brandSubtle,
        },
      ]}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: isSelected }}
    >
      <View style={styles.selectableLabelCol}>
        <Text
          style={[
            styles.selectableLabel,
            { color: theme.text.primary },
            isSelected && { color: theme.text.brand },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text
            style={[styles.selectableSublabel, { color: theme.text.tertiary }]}
            numberOfLines={1}
          >
            {sublabel}
          </Text>
        ) : null}
      </View>
      {isSelected && <Check size={18} color={theme.text.brand} />}
    </CustomButton>
  );
});

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
  descriptionInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 60,
    width: "100%",
    flexGrow: 1,
    textAlignVertical: "top",
  },
  descriptionInputContainer: {
    minHeight: 60,
    alignItems: "stretch",
    paddingVertical: spacing[8],
  },
  readOnlyFields: { gap: spacing[8] },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing[8],
  },
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
