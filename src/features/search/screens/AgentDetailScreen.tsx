import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "expo-router";
import { CustomSpinner } from "@/components/feedback/CustomSpinner";
import { CustomButton } from "@/components/buttons";
import { CustomTextInput } from "@/components/inputs/CustomTextInput";
import { useAgentDetailScreen } from "@/features/search/hooks";
import { useUpdateAgentDescriptionMutation } from "@/store/api";
import { LoadingSkeleton, ErrorState, StatusBadge } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { DataTable } from "@/components/tables";
import type { ColumnDef } from "@/components/tables/DataTable";
import type { RunListRow } from "@/features/analytics/types";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { cellText, getSuccessRateColor } from "@/components/tables/cellStyles";
import { useCurrencyFormatter } from "@/features/analytics/hooks/useCurrencyFormatter";
import { useAppSelector } from "@/store/hooks";
import { selectOrgId } from "@/store/slices/filtersSlice";
import { spacing, radius, borderWidth } from "@/theme/tokens";
import { buildEntityRoute, resolveTabFromPathname } from "@/constants/routes";
import { keyExtractors } from "@/constants";

const EMPTY_USER_MAP: Record<string, string> = {};

interface AgentDetailScreenProps {
  agentId: string;
}

export function AgentDetailScreen({ agentId }: AgentDetailScreenProps) {
  const { t } = useTranslation();
  const { data, loading, error, refetch } = useAgentDetailScreen(agentId);
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const ct = cellText(mode);
  const { formatCurrency } = useCurrencyFormatter();
  const router = useRouter();
  const pathname = usePathname();

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const navigateTo = useCallback(
    (entityType: "agent" | "project" | "team" | "human" | "run", entityId: string) => {
      const tab = resolveTabFromPathname(pathnameRef.current);
      const route = buildEntityRoute(tab, entityType, entityId);
      router.push(route as never);
    },
    [router],
  );

  const userMap = useMemo(() => data?.userMap ?? EMPTY_USER_MAP, [data?.userMap]);

  const runColumns = useMemo<ColumnDef<RunListRow>[]>(
    () => [
      { key: "id", header: t("entityDetail.table.runId"), width: 140, render: (r) => (
        <CustomButton onPress={() => navigateTo("run", r.id)} accessibilityRole="link" accessibilityLabel={`View run ${r.id}`}>
          <Text style={ct.link} numberOfLines={1}>{r.id.slice(0, 12)}</Text>
        </CustomButton>
      ) },
      {
        key: "userId",
        header: t("entityDetail.table.owner"),
        width: 140,
        render: (r) => (
          <CustomButton onPress={() => navigateTo("human", r.userId)} accessibilityRole="link" accessibilityLabel={`View user ${userMap[r.userId] ?? r.userId}`}>
            <Text style={ct.link} numberOfLines={1}>{userMap[r.userId] ?? r.userId}</Text>
          </CustomButton>
        ),
        sortAccessor: (r) => userMap[r.userId] ?? r.userId,
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
    ],
    [ct, navigateTo, userMap, t, formatCurrency],
  );

  if (loading) return <LoadingSkeleton variant="text" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <ScreenWrapper headerProps={{ title: data.agent.name, subtitle: `${data.projectName} · ${data.teamName}` }} showFilterBar={false}>
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatItem label={t("entityDetail.runs")} value={String(data.totalRuns)} theme={theme} />
          <StatItem
            label={t("entityDetail.success")}
            value={`${(data.successRate * 100).toFixed(1)}%`}
            theme={theme}
            valueColor={getSuccessRateColor(data.successRate, mode)}
          />
          <StatItem label={t("entityDetail.avgDuration")} value={`${(data.avgDurationMs / 1000).toFixed(1)}s`} theme={theme} />
          <StatItem label={t("entityDetail.cost")} value={formatCurrency(data.totalCostUsd)} theme={theme} />
        </View>

        <AgentDescriptionSection
          agentId={agentId}
          description={data.agent.description}
        />

        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t("entityDetail.recentRuns")}</Text>
        <DataTable
          columns={runColumns}
          data={data.recentRuns}
          keyExtractor={keyExtractors.byId}
          initialSortBy="startedAtIso"
          initialSortDirection="desc"
          emptyMessage={t("entityDetail.noRunsYet")}
        />
      </View>
    </ScreenWrapper>
  );
}

const AgentDescriptionSection = React.memo(function AgentDescriptionSection({
  agentId,
  description,
}: {
  agentId: string;
  description: string;
}) {
  const { t } = useTranslation();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const orgId = useAppSelector(selectOrgId);
  const [updateDescription] = useUpdateAgentDescriptionMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEditPress = useCallback(() => {
    setDraft(description);
    setIsEditing(true);
  }, [description]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateDescription({ orgId, agentId, description: draft }).unwrap();
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }, [agentId, draft, orgId, updateDescription]);

  return (
    <View
      style={[
        styles.descriptionSection,
        { backgroundColor: theme.bg.surface, borderColor: theme.border.default },
      ]}
    >
      <View style={styles.descriptionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          {t("entityDetail.promptDescription")}
        </Text>
        {!isEditing && (
          <CustomButton onPress={handleEditPress} accessibilityLabel="Edit description">
            <Text style={[styles.editButton, { color: theme.border.brand }]}>
              {t("common.edit")}
            </Text>
          </CustomButton>
        )}
      </View>
      {isEditing ? (
        <View style={styles.descriptionEditArea}>
          <CustomTextInput
            value={draft}
            onChangeText={setDraft}
            multiline
            numberOfLines={4}
            placeholder={t("entityDetail.descriptionPlaceholder")}
            style={styles.descriptionInput}
            inputContainerStyle={styles.descriptionInputContainer}
            accessibilityLabel="Agent description"
          />
          <View style={styles.descriptionActions}>
            <CustomButton onPress={handleCancelEdit} accessibilityLabel="Cancel editing">
              <Text style={[styles.actionButton, { color: theme.text.secondary }]}>
                {t("common.cancel")}
              </Text>
            </CustomButton>
            <CustomButton onPress={handleSave} accessibilityLabel="Save description">
              <View style={[styles.saveButton, { backgroundColor: theme.border.brand }]}>
                {saving ? (
                  <CustomSpinner size={14} color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t("common.save")}</Text>
                )}
              </View>
            </CustomButton>
          </View>
        </View>
      ) : (
        <Text
          style={[
            styles.descriptionText,
            { color: description ? theme.text.primary : theme.text.secondary },
          ]}
        >
          {description || t("entityDetail.noDescription")}
        </Text>
      )}
    </View>
  );
});

type ThemeColors = (typeof semanticThemes)["dark"];

const StatItem = React.memo(function StatItem({
  label,
  value,
  theme,
  valueColor,
}: {
  label: string;
  value: string;
  theme: ThemeColors;
  valueColor?: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: valueColor ?? theme.text.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  content: { gap: spacing[16] },
  statsRow: { flexDirection: "row", gap: spacing[16], flexWrap: "wrap" },
  stat: { alignItems: "center", minWidth: 70 },
  statValue: { fontSize: 16, fontWeight: "600" },
  statLabel: { fontSize: 11, marginTop: spacing[2] },
  sectionTitle: { fontSize: 16, fontWeight: "600" },
  descriptionSection: {
    borderWidth: borderWidth.hairline,
    borderRadius: radius.sm,
    padding: spacing[16],
    gap: spacing[8],
  },
  descriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  descriptionText: { fontSize: 14, lineHeight: 20 },
  editButton: { fontSize: 13, fontWeight: "600" },
  descriptionEditArea: { gap: spacing[8] },
  descriptionInput: { fontSize: 14, lineHeight: 20, minHeight: 80, width: "100%", flexGrow: 1, textAlignVertical: "top" },
  descriptionInputContainer: { minHeight: 80, alignItems: "stretch", paddingVertical: spacing[8] },
  descriptionActions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing[8] },
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
