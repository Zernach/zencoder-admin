import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  LiveAssistantsSection,
} from "@/components/dashboard";
import { ScreenWrapper } from "@/components/screen";
import { useSectionRef } from "@/hooks/useRegisterSection";
import { OverviewInsightsSection } from "./OverviewInsightsSection";

export default function OverviewDashboardScreen() {
  const { t } = useTranslation();
  const refFor = useSectionRef();

  const headerProps = useMemo(
    () => ({ title: t("dashboard.title"), subtitle: t("dashboard.subtitle") }),
    [t],
  );

  return (
    <ScreenWrapper headerProps={headerProps}>
      <View ref={refFor("live-assistants")} nativeID="live-assistants">
        <LiveAssistantsSection />
      </View>
      <OverviewInsightsSection />
    </ScreenWrapper>
  );
}
