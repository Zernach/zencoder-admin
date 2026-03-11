import React, { useCallback, useMemo, useRef, useState } from "react";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import { CustomButton } from "@/components/buttons";
import { CustomSwitch } from "@/components/inputs";
import { Moon, Mail, MessageSquare, RefreshCw, LogOut, Trash2, User, Globe, DollarSign, ChevronRight } from "lucide-react-native";
import { SectionHeader } from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { SignOutNoticeModal } from "@/features/analytics/components/SignOutNoticeModal";
import { LanguageSelectionModal } from "@/features/analytics/components/LanguageSelectionModal";
import { CurrencySelectionModal } from "@/features/analytics/components/CurrencySelectionModal";
import { LANGUAGE_OPTIONS, CURRENCY_OPTIONS } from "@/types/settings";
import { spacing, radius } from "@/theme/tokens";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { typography } from "@/theme/typography";
import { useAppDispatch, useAppSelector, openModal, ModalName, selectSelectedLanguage, selectSelectedCurrency } from "@/store";

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
  { label: "Auto-refresh", description: "Refresh dashboard data every 30 seconds", key: "autoRefresh", icon: RefreshCw },
];

const INITIAL_SETTINGS: Record<NonThemeSettingKey, boolean> = {
  emailNotifs: true,
  slackInteg: true,
  autoRefresh: true,
};

const TOGGLE_LABEL_KEYS: Record<SettingToggleKey, string> = {
  darkMode: "settings.darkMode",
  emailNotifs: "settings.emailNotifications",
  slackInteg: "settings.slackIntegration",
  autoRefresh: "settings.autoRefresh",
};

const TOGGLE_DESC_KEYS: Record<SettingToggleKey, string> = {
  darkMode: "settings.darkModeDescription",
  emailNotifs: "settings.emailDescription",
  slackInteg: "settings.slackDescription",
  autoRefresh: "settings.autoRefreshDescription",
};

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { mode, setMode, toggleMode } = useThemeMode();
  const theme = semanticThemes[mode];
  const dispatch = useAppDispatch();
  const [settings, setSettings] = useState<Record<NonThemeSettingKey, boolean>>(INITIAL_SETTINGS);

  const toggle = useCallback((key: SettingToggleKey) => {
    if (key === "darkMode") {
      toggleMode();
      return;
    }

    setSettings((currentSettings) => ({ ...currentSettings, [key]: !currentSettings[key] }));
  }, [toggleMode]);

  // Stable per-key toggle handlers to avoid inline closures in .map()
  const toggleHandlerCache = useRef(new Map<string, () => void>()).current;
  const toggleRef = useRef(toggle);
  toggleRef.current = toggle;
  const getToggleHandler = useCallback((key: SettingToggleKey) => {
    let handler = toggleHandlerCache.get(key);
    if (!handler) {
      handler = () => toggleRef.current(key);
      toggleHandlerCache.set(key, handler);
    }
    return handler;
  }, [toggleHandlerCache]);

  const selectedLanguage = useAppSelector(selectSelectedLanguage);
  const selectedLanguageLabel = useMemo(
    () => LANGUAGE_OPTIONS.find((o) => o.code === selectedLanguage)?.nativeLabel ?? "English",
    [selectedLanguage],
  );

  const handleOpenLanguageSelection = useCallback(
    () => dispatch(openModal(ModalName.LanguageSelection)),
    [dispatch],
  );

  const selectedCurrency = useAppSelector(selectSelectedCurrency);
  const selectedCurrencyOption = useMemo(
    () => CURRENCY_OPTIONS.find((o) => o.code === selectedCurrency),
    [selectedCurrency],
  );
  const selectedCurrencyLabel = selectedCurrencyOption
    ? `${selectedCurrencyOption.symbol} ${selectedCurrencyOption.code}`
    : "EUR";

  const handleOpenCurrencySelection = useCallback(
    () => dispatch(openModal(ModalName.CurrencySelection)),
    [dispatch],
  );

  const handleOpenSignOut = useCallback(
    () => dispatch(openModal(ModalName.SignOutNotice)),
    [dispatch],
  );

  const seatsPurchased = 100;
  const seatsUsed = 73;
  const seatPercent = Math.round((seatsUsed / seatsPurchased) * 100);

  const refFor = useSectionRef();

  const headerProps = useMemo(
    () => ({ title: t("settings.title"), subtitle: t("settings.subtitle"), showBackButton: false }),
    [t],
  );

  return (
    <ScreenWrapper showFilterBar={false} headerProps={headerProps}>
      {/* Profile hero card */}
      <View ref={refFor("profile")} nativeID="profile" style={[styles.profileCard, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
        <View style={[styles.avatarCircle, { backgroundColor: theme.border.brand + "22" }]}>
          <User size={28} color={theme.border.brand} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.text.primary }]}>{t("settings.adminUser")}</Text>
          <Text selectable={false} style={[styles.profileEmail, { color: theme.text.secondary }]} pointerEvents="none">{t("settings.adminEmail")}</Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.border.brand + "1A" }]}>
            <Text style={[styles.roleBadgeText, { color: theme.text.brand }]}>{t("settings.ownerRole")}</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View ref={refFor("preferences")} nativeID="preferences" style={styles.section}>
        <SectionHeader
          title={t("settings.preferences")}
          subtitle={t("settings.preferencesSubtitle")}
        />
        <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          {TOGGLES.map((tog, i) => {
            const IconComp = tog.icon;
            const isEnabled = tog.key === "darkMode" ? mode === "dark" : settings[tog.key];
            return (
              <View key={tog.key} style={[styles.row, i > 0 && styles.rowDivider]}>
                <View style={[styles.toggleIcon, { backgroundColor: theme.bg.surfaceHover }]}>
                  <IconComp size={16} color={theme.text.secondary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.label, { color: theme.text.primary }]}>
                    {tog.key === "darkMode"
                      ? t("settings.darkModeLabel", { mode: t(mode === "dark" ? "settings.dark" : "settings.light") })
                      : t(TOGGLE_LABEL_KEYS[tog.key])}
                  </Text>
                  <Text style={[styles.desc, { color: theme.text.tertiary }]}>{t(TOGGLE_DESC_KEYS[tog.key])}</Text>
                </View>
                <CustomSwitch
                  value={isEnabled}
                  onValueChange={getToggleHandler(tog.key)}
                  accessibilityLabel={
                    tog.key === "darkMode"
                      ? t("settings.themeModeLabel", { mode: t(mode === "dark" ? "settings.dark" : "settings.light") })
                      : t(TOGGLE_LABEL_KEYS[tog.key])
                  }
                />
              </View>
            );
          })}

        </View>
      </View>

      {/* Internationalization */}
      <View ref={refFor("internationalization")} nativeID="internationalization" style={styles.section}>
        <SectionHeader
          title={t("settings.internationalization")}
          subtitle={t("settings.internationalizationSubtitle")}
        />
        <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          {/* Language preference row */}
          <CustomButton
            onPress={handleOpenLanguageSelection}
            style={styles.row}
            accessibilityRole="button"
            accessibilityLabel={t("settings.selectLanguage")}
          >
            <View style={[styles.toggleIcon, { backgroundColor: theme.bg.surfaceHover }]}>
              <Globe size={16} color={theme.text.secondary} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.label, { color: theme.text.primary }]}>{t("settings.language")}</Text>
              <Text style={[styles.desc, { color: theme.text.tertiary }]}>{t("settings.languageDescription")}</Text>
            </View>
            <View style={styles.langValue}>
              <Text style={[styles.langValueText, { color: theme.text.secondary }]}>{selectedLanguageLabel}</Text>
              <ChevronRight size={16} color={theme.text.tertiary} />
            </View>
          </CustomButton>

          {/* Currency preference row */}
          <CustomButton
            onPress={handleOpenCurrencySelection}
            style={[styles.row, styles.rowDivider]}
            accessibilityRole="button"
            accessibilityLabel={t("settings.selectCurrency")}
          >
            <View style={[styles.toggleIcon, { backgroundColor: theme.bg.surfaceHover }]}>
              <DollarSign size={16} color={theme.text.secondary} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.label, { color: theme.text.primary }]}>{t("settings.currency")}</Text>
              <Text style={[styles.desc, { color: theme.text.tertiary }]}>{t("settings.currencyDescription")}</Text>
            </View>
            <View style={styles.langValue}>
              <Text style={[styles.langValueText, { color: theme.text.secondary }]}>{selectedCurrencyLabel}</Text>
              <ChevronRight size={16} color={theme.text.tertiary} />
            </View>
          </CustomButton>
        </View>
      </View>

      {/* Organization */}
      <View ref={refFor("organization")} nativeID="organization" style={styles.section}>
        <SectionHeader
          title={t("settings.organization")}
          subtitle={t("settings.organizationSubtitle")}
        />
        <View style={[styles.card, { backgroundColor: theme.bg.surface, borderColor: theme.border.subtle }]}>
          <View style={styles.row}>
            <View style={[styles.toggleIcon, { backgroundColor: theme.bg.surfaceHover }]}>
              <MessageSquare size={16} color={theme.text.secondary} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.label, { color: theme.text.primary }]}>{t(TOGGLE_LABEL_KEYS.slackInteg)}</Text>
              <Text style={[styles.desc, { color: theme.text.tertiary }]}>{t(TOGGLE_DESC_KEYS.slackInteg)}</Text>
            </View>
            <CustomSwitch
              value={settings.slackInteg}
              onValueChange={getToggleHandler("slackInteg")}
              accessibilityLabel={t(TOGGLE_LABEL_KEYS.slackInteg)}
            />
          </View>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>{t("settings.orgId")}</Text>
            <Text style={[styles.infoValueMono, { color: theme.text.primary }]}>org_zencoder_001</Text>
          </View>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>{t("settings.plan")}</Text>
            <View style={[styles.planBadge, { backgroundColor: theme.bg.brandSubtle }]}>
              <Text style={[styles.planBadgeText, { color: theme.text.brand }]}>{t("settings.enterprise")}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>{t("settings.seats")}</Text>
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
            {t("settings.seatsUsed", { percent: seatPercent })}
          </Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View ref={refFor("danger-zone")} nativeID="danger-zone" style={styles.section}>
        <SectionHeader
          title={t("settings.dangerZone")}
          subtitle={t("settings.dangerZoneSubtitle")}
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
            accessibilityLabel={t("settings.clearCacheLabel")}
          >
            <View style={styles.btnRow}>
              <Trash2 size={15} color={theme.border.brand} />
              <Text style={[styles.dangerText, { color: theme.border.brand }]}>{t("common.clearCache")}</Text>
            </View>
          </CustomButton>

          <CustomButton
            onPress={handleOpenSignOut}
            style={[styles.signOutBtn, { borderColor: theme.border.default, backgroundColor: theme.bg.surface }]}
            accessibilityRole="button"
            accessibilityLabel={t("settings.signOutLabel")}
          >
            <View style={styles.btnRow}>
              <LogOut size={15} color={theme.text.primary} />
              <Text style={[styles.signOutText, { color: theme.text.primary }]}>{t("settings.signOutLabel")}</Text>
            </View>
          </CustomButton>
        </View>
      </View>

      <SignOutNoticeModal />
      <LanguageSelectionModal />
      <CurrencySelectionModal />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[12],
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[20],
    gap: spacing[16],
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: spacing[4],
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
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
    marginTop: spacing[4],
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
    padding: spacing[16],
    gap: spacing[12],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[4],
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.15)",
    paddingTop: spacing[12],
  },
  toggleIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[12],
  },
  rowText: { flex: 1, marginRight: spacing[16] },
  label: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: 14,
    fontWeight: "600",
  },
  desc: {
    fontFamily: typography.label.fontFamily,
    fontSize: 12,
    marginTop: spacing[2],
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing[6],
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
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  planBadgeText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    fontWeight: "600",
  },
  seatBarOuter: {
    height: 6,
    borderRadius: radius.sm,
    backgroundColor: "rgba(128,128,128,0.15)",
    overflow: "hidden",
  },
  seatBarInner: {
    height: "100%",
    borderRadius: radius.sm,
  },
  seatCaption: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    marginTop: -spacing[4],
  },
  dangerCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: spacing[16],
    gap: spacing[12],
  },
  dangerBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[12],
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  dangerText: { fontWeight: "600", fontSize: 14 },
  signOutBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing[12],
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  signOutText: { fontWeight: "600", fontSize: 14 },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[8],
  },
  langValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  langValueText: {
    fontFamily: typography.tableBody.fontFamily,
    fontSize: 13,
    fontWeight: "500",
  },
});
