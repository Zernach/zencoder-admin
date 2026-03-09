import React, { useCallback, useState } from "react";
import { View, Text, Switch, Modal, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { X } from "lucide-react-native";
import { SectionHeader } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { useCreateTeam } from "@/features/analytics/hooks/useCreateTeam";
import { CreateTeamForm } from "@/features/analytics/components/CreateTeamForm";
import { spacing } from "@/theme/tokens";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { typography } from "@/theme/typography";

interface SettingToggle {
  label: string;
  description: string;
  key: string;
}

const TOGGLES: SettingToggle[] = [
  { label: "Dark Mode", description: "Use dark theme (default)", key: "darkMode" },
  { label: "Email Notifications", description: "Receive email alerts for anomalies", key: "emailNotifs" },
  { label: "Slack Integration", description: "Post alerts to Slack channel", key: "slackInteg" },
  { label: "Auto-refresh", description: "Refresh dashboard data every 30 seconds", key: "autoRefresh" },
];

const DEMO_SIGN_OUT_MESSAGE = "This is a dashboard demo, so you are unable to sign out.";

export default function SettingsScreen() {
  const { mode, setMode } = useThemeMode();
  const theme = semanticThemes[mode];
  const { create: createTeam, loading: createTeamLoading, error: createTeamError } = useCreateTeam();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showSignOutNotice, setShowSignOutNotice] = useState(false);
  const [settings, setSettings] = useState<Record<string, boolean>>({
    emailNotifs: true,
    slackInteg: false,
    autoRefresh: true,
  });

  const handleCreateTeam = useCallback(
    async (values: { name: string }) => {
      await createTeam(values);
      setShowCreateTeam(false);
    },
    [createTeam],
  );

  const toggle = (key: string) => {
    if (key === "darkMode") {
      setMode(mode === "dark" ? "light" : "dark");
      return;
    }

    setSettings((currentSettings) => ({ ...currentSettings, [key]: !currentSettings[key] }));
  };

  return (
    <ScreenWrapper
      showFilterBar={false}
      headerProps={{
        title: "Settings",
        subtitle: "Configure your dashboard preferences",
      }}
    >
      <View style={styles.section}>
        <SectionHeader title="Preferences" />
        <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          {TOGGLES.map((t, i) => (
            <View key={t.key} style={[styles.row, i > 0 && styles.rowDivider]}>
              <View style={styles.rowText}>
                <Text style={[styles.label, { color: theme.text.primary }]}>
                  {t.key === "darkMode" ? `${t.label}: ${mode === "dark" ? "Dark" : "Light"}` : t.label}
                </Text>
                <Text style={[styles.desc, { color: theme.text.tertiary }]}>{t.description}</Text>
              </View>
              <Switch
                value={t.key === "darkMode" ? mode === "dark" : (settings[t.key] ?? false)}
                onValueChange={() => toggle(t.key)}
                trackColor={{ false: theme.border.default, true: theme.border.brand }}
                thumbColor={theme.text.primary}
                accessibilityRole="switch"
                accessibilityLabel={
                  t.key === "darkMode" ? `Theme mode ${mode === "dark" ? "Dark" : "Light"}` : t.label
                }
                accessibilityState={{
                  checked: t.key === "darkMode" ? mode === "dark" : (settings[t.key] ?? false),
                }}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View style={styles.sectionHeaderWrap}>
            <SectionHeader title="Organization" />
          </View>
          <CustomButton
            onPress={() => setShowCreateTeam(true)}
            style={[styles.createButton, { backgroundColor: theme.border.brand }]}
            accessibilityRole="button"
            accessibilityLabel="Create Team"
          >
            <Text style={[styles.createButtonText, { color: theme.text.onBrand }]}>+ Create Team</Text>
          </CustomButton>
        </View>
        <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Org ID</Text>
            <Text style={[styles.infoValue, { color: theme.text.primary }]}>org_zencoder_001</Text>
          </View>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Plan</Text>
            <Text style={[styles.infoValue, { color: theme.text.primary }]}>Enterprise</Text>
          </View>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Seats</Text>
            <Text style={[styles.infoValue, { color: theme.text.primary }]}>100 purchased</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Danger Zone" />
        <View style={[styles.dangerCard, { borderColor: theme.state.error + "40" }]}>
          <CustomButton
            style={[styles.dangerBtn, { borderColor: theme.state.error, backgroundColor: theme.state.error + "1A" }]}
            accessibilityRole="button"
            accessibilityLabel="Clear all cached data"
          >
            <Text style={[styles.dangerText, { color: theme.state.error }]}>Clear Cache</Text>
          </CustomButton>

          <CustomButton
            onPress={() => setShowSignOutNotice(true)}
            style={[styles.signOutBtn, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
          >
            <Text style={[styles.signOutText, { color: theme.text.primary }]}>Sign Out</Text>
          </CustomButton>

          {showSignOutNotice && (
            <View style={[styles.noticeCard, { backgroundColor: theme.state.warning + "1A", borderColor: theme.state.warning + "40" }]}>
              <Text style={[styles.noticeText, { color: theme.text.primary }]}>
                {DEMO_SIGN_OUT_MESSAGE}
              </Text>
              <CustomButton
                onPress={() => setShowSignOutNotice(false)}
                style={[styles.dismissBtn, { borderColor: theme.border.default }]}
                accessibilityRole="button"
                accessibilityLabel="Dismiss sign out notice"
              >
                <Text style={[styles.dismissText, { color: theme.text.secondary }]}>Dismiss</Text>
              </CustomButton>
            </View>
          )}
        </View>
      </View>

      <Modal
        transparent
        visible={showCreateTeam}
        animationType="fade"
        onRequestClose={() => setShowCreateTeam(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.bg.overlay }]}>
          <CustomButton
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowCreateTeam(false)}
            accessibilityRole="button"
            accessibilityLabel="Close create team form"
          />
          <View style={[styles.modalPanel, { backgroundColor: theme.bg.subtle, borderColor: theme.border.default }]}>
            <View style={styles.modalHeader}>
              <CustomButton
                onPress={() => setShowCreateTeam(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={16} color={theme.text.secondary} />
              </CustomButton>
            </View>
            <CreateTeamForm onSubmit={handleCreateTeam} loading={createTeamLoading} error={createTeamError} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing[4],
    gap: spacing[3],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[1],
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.15)",
    paddingTop: spacing[3],
  },
  rowText: { flex: 1, marginRight: spacing[4] },
  label: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: 14,
    fontWeight: "600",
  },
  desc: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  infoLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
  },
  infoValue: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: 13,
    fontWeight: "500",
  },
  dangerCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: spacing[4],
    gap: spacing[3],
  },
  dangerBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing[3],
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  dangerText: { fontWeight: "600", fontSize: 14 },
  signOutBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing[3],
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  signOutText: { fontWeight: "600", fontSize: 14 },
  noticeCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: spacing[3],
    gap: spacing[2],
  },
  noticeText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  dismissBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  dismissText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  sectionHeaderWrap: {
    flex: 1,
    minWidth: 0,
  },
  createButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: "auto",
    flexShrink: 0,
    maxWidth: "100%",
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalPanel: {
    width: 400,
    maxWidth: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
