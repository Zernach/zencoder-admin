import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { CustomSwitch } from "@/components/inputs";
import {
  Moon,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  LogOut,
  Trash2,
  User,
} from "lucide-react-native";
import { SectionHeader } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { CreateTeamModal } from "@/features/analytics/components/CreateTeamModal";
import { SignOutNoticeModal } from "@/features/analytics/components/SignOutNoticeModal";
import { spacing, radius } from "@/theme/tokens";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { typography } from "@/theme/typography";
import { useAppDispatch, openModal, ModalName } from "@/store";

type SettingToggleKey = "darkMode" | "emailNotifs" | "slackInteg" | "autoRefresh";
type NonThemeSettingKey = Exclude<SettingToggleKey, "darkMode">;

interface SettingToggle {
  label: string;
  description: string;
  key: SettingToggleKey;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const TOGGLES: SettingToggle[] = [
  { label: "Dark Mode", description: "Use dark theme (default)", key: "darkMode", icon: Moon },
  { label: "Email Notifications", description: "Receive email alerts for anomalies", key: "emailNotifs", icon: Mail },
  { label: "Slack Integration", description: "Post alerts to Slack channel", key: "slackInteg", icon: MessageSquare },
  { label: "Auto-refresh", description: "Refresh dashboard data every 30 seconds", key: "autoRefresh", icon: RefreshCw },
];

const INITIAL_SETTINGS: Record<NonThemeSettingKey, boolean> = {
  emailNotifs: true,
  slackInteg: true,
  autoRefresh: true,
};

export default function SettingsScreen() {
  const { mode, setMode } = useThemeMode();
  const theme = semanticThemes[mode];
  const dispatch = useAppDispatch();
  const [settings, setSettings] = useState<Record<NonThemeSettingKey, boolean>>(INITIAL_SETTINGS);

  const toggle = (key: SettingToggleKey) => {
    if (key === "darkMode") {
      setMode(mode === "dark" ? "light" : "dark");
      return;
    }

    setSettings((currentSettings) => ({ ...currentSettings, [key]: !currentSettings[key] }));
  };

  const seatsPurchased = 100;
  const seatsUsed = 73;
  const seatPercent = Math.round((seatsUsed / seatsPurchased) * 100);

  return (
    <ScreenWrapper
      showFilterBar={false}
      headerProps={{
        title: "Settings",
        subtitle: "Configure your dashboard preferences",
      }}
    >
      {/* Profile hero card */}
      <View style={[styles.profileCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.border.brand + "22" }]}>
          <User size={28} color={theme.border.brand} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.text.primary }]}>Admin User</Text>
          <Text style={[styles.profileEmail, { color: theme.text.secondary }]}>admin@zencoder.io</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.border.brand + "1A" }]}>
            <Text style={[styles.roleBadgeText, { color: theme.text.brand }]}>Owner</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <SectionHeader
          title="Preferences"
          subtitle="Appearance and notifications"
          action={<SlidersHorizontal size={16} color={theme.text.tertiary} />}
        />
        <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          {TOGGLES.map((t, i) => {
            const IconComp = t.icon;
            const isEnabled = t.key === "darkMode" ? mode === "dark" : settings[t.key];
            return (
              <View key={t.key} style={[styles.row, i > 0 && styles.rowDivider]}>
                <View style={[styles.toggleIcon, { backgroundColor: theme.bg.surfaceHover }]}>
                  <IconComp size={16} color={theme.text.secondary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.label, { color: theme.text.primary }]}>
                    {t.key === "darkMode" ? `${t.label}: ${mode === "dark" ? "Dark" : "Light"}` : t.label}
                  </Text>
                  <Text style={[styles.desc, { color: theme.text.tertiary }]}>{t.description}</Text>
                </View>
                <CustomSwitch
                  value={isEnabled}
                  onValueChange={() => toggle(t.key)}
                  accessibilityLabel={
                    t.key === "darkMode" ? `Theme mode ${mode === "dark" ? "Dark" : "Light"}` : t.label
                  }
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Organization */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View style={styles.sectionHeaderWrap}>
            <SectionHeader
              title="Organization"
              subtitle="Team and billing details"
            />
          </View>
          <CustomButton
            onPress={() => dispatch(openModal(ModalName.CreateTeam))}
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
            <Text style={[styles.infoValueMono, { color: theme.text.primary }]}>org_zencoder_001</Text>
          </View>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Plan</Text>
            <View style={[styles.planBadge, { backgroundColor: theme.state.success + "1A" }]}>
              <Text style={[styles.planBadgeText, { color: theme.state.success }]}>Enterprise</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>Seats</Text>
            <Text style={[styles.infoValue, { color: theme.text.primary }]}>{seatsUsed} / {seatsPurchased}</Text>
          </View>
          <View style={styles.seatBarOuter}>
            <View
              style={[
                styles.seatBarInner,
                {
                  backgroundColor: theme.border.brand,
                  width: `${seatPercent}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.seatCaption, { color: theme.text.tertiary }]}>
            {seatPercent}% of seats used
          </Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <SectionHeader
          title="Danger Zone"
          subtitle="Irreversible and destructive actions"
          action={<ShieldAlert size={16} color={theme.state.error} />}
        />
        <View
          style={[
            styles.dangerCard,
            {
              borderColor: theme.state.error + "40",
              backgroundColor: theme.state.error + "08",
            },
          ]}
        >
          <CustomButton
            style={[styles.dangerBtn, { borderColor: theme.border.brand, backgroundColor: theme.bg.brandSubtle }]}
            accessibilityRole="button"
            accessibilityLabel="Clear all cached data"
          >
            <View style={styles.btnRow}>
              <Trash2 size={15} color={theme.border.brand} />
              <Text style={[styles.dangerText, { color: theme.border.brand }]}>Clear Cache</Text>
            </View>
          </CustomButton>

          <CustomButton
            onPress={() => dispatch(openModal(ModalName.SignOutNotice))}
            style={[styles.signOutBtn, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}
            accessibilityRole="button"
            accessibilityLabel="Sign Out"
          >
            <View style={styles.btnRow}>
              <LogOut size={15} color={theme.text.primary} />
              <Text style={[styles.signOutText, { color: theme.text.primary }]}>Sign Out</Text>
            </View>
          </CustomButton>
        </View>
      </View>

      <SignOutNoticeModal />
      <CreateTeamModal />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[5],
    gap: spacing[4],
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontFamily: typography.sectionTitle.fontFamily,
    fontSize: 18,
    fontWeight: "700",
  },
  profileEmail: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  roleBadgeText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: radius.lg,
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
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
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
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
  },
  infoValue: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: 13,
    fontWeight: "600",
  },
  infoValueMono: {
    fontFamily: typography.codeValue.fontFamily,
    fontSize: 12,
    fontWeight: "500",
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  planBadgeText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    fontWeight: "600",
  },
  seatBarOuter: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(128,128,128,0.15)",
    overflow: "hidden",
  },
  seatBarInner: {
    height: "100%",
    borderRadius: 3,
  },
  seatCaption: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    marginTop: -4,
  },
  dangerCard: {
    borderRadius: radius.lg,
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
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    borderRadius: radius.sm,
    marginLeft: "auto",
    flexShrink: 0,
    maxWidth: "100%",
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
