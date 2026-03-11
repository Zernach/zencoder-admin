import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomButton } from "@/components/buttons";
import { buildChatHistoryRoute, resolveTabFromPathname } from "@/constants/routes";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { borderWidth, layout, radius, spacing } from "@/theme/tokens";
import { MiniChatModal } from "./MiniChatModal";

const FAB_SIZE = 56;

export const FloatingChatButton = React.memo(function FloatingChatButton() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const bp = useBreakpoint();
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const isMobile = bp === "mobile";
  const isDesktop = bp === "desktop";
  const [expanded, setExpanded] = useState(false);

  const targetRoute = useMemo(() => {
    const tab = resolveTabFromPathname(pathname);
    return buildChatHistoryRoute(tab);
  }, [pathname]);

  const handlePress = useCallback(() => {
    if (isDesktop) {
      setExpanded(true);
      return;
    }

    if (pathname === targetRoute) {
      return;
    }

    router.push(targetRoute as never);
  }, [isDesktop, pathname, router, targetRoute]);

  const handleClose = useCallback(() => {
    setExpanded(false);
  }, []);

  const buttonStyle = useMemo(
    () => [
      styles.button,
      {
        backgroundColor: theme.border.brand,
        borderColor: theme.border.brand,
        right: isMobile ? spacing[16] : spacing[24],
        bottom: isMobile
          ? insets.bottom + layout.touchTargetMin + spacing[20]
          : spacing[24],
      },
    ],
    [insets.bottom, isMobile, theme.border.brand],
  );

  if (isDesktop && expanded) {
    return <MiniChatModal onClose={handleClose} />;
  }

  return (
    <CustomButton
      onPress={handlePress}
      style={buttonStyle}
      accessibilityRole="button"
      accessibilityLabel="Open chat"
      testID="floating-chat-button"
    >
      <MessageCircle size={22} color={theme.text.onBrand} />
    </CustomButton>
  );
});

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.full,
    borderWidth: borderWidth.hairline,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 300,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
});
