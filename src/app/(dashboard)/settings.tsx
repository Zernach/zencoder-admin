import React, { useState } from "react";
import { View, Text, Switch, Pressable, StyleSheet } from "react-native";
import { SectionHeader } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { spacing } from "@/theme/tokens";

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

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    darkMode: true,
    emailNotifs: true,
    slackInteg: false,
    autoRefresh: true,
  });

  const toggle = (key: string) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <ScreenWrapper
      headerProps={{
        title: "Settings",
        subtitle: "Configure your dashboard preferences",
      }}
    >
      <View style={styles.section}>
        <SectionHeader title="Preferences" />
        <View style={styles.card}>
          {TOGGLES.map((t) => (
            <View key={t.key} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.label}>{t.label}</Text>
                <Text style={styles.desc}>{t.description}</Text>
              </View>
              <Switch
                value={settings[t.key] ?? false}
                onValueChange={() => toggle(t.key)}
                trackColor={{ false: "#2d2d2d", true: "#30a8dc" }}
                thumbColor="#e5e5e5"
                accessibilityRole="switch"
                accessibilityLabel={t.label}
                accessibilityState={{ checked: settings[t.key] ?? false }}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Organization" />
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Org ID</Text>
            <Text style={styles.infoValue}>org_zencoder_001</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan</Text>
            <Text style={styles.infoValue}>Enterprise</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Seats</Text>
            <Text style={styles.infoValue}>100 purchased</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Danger Zone" />
        <Pressable
          style={styles.dangerBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear all cached data"
        >
          <Text style={styles.dangerText}>Clear Cache</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#242424",
    padding: spacing[4],
    gap: spacing[4],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowText: { flex: 1, marginRight: spacing[4] },
  label: { fontSize: 14, fontWeight: "500", color: "#e5e5e5" },
  desc: { fontSize: 12, color: "#8a8a8a", marginTop: 2 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  infoLabel: { fontSize: 13, color: "#8a8a8a" },
  infoValue: { fontSize: 13, color: "#e5e5e5" },
  dangerBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    padding: spacing[3],
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  dangerText: { color: "#ef4444", fontWeight: "600", fontSize: 14 },
});
