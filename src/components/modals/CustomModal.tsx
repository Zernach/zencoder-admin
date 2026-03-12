import React, { useEffect } from "react";
import { View, Text, Modal, StyleSheet, Pressable, Platform } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { CustomButton } from "@/components/buttons";
import { CustomList } from "@/components/lists/CustomList";
import { X } from "lucide-react-native";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";
import { spacing, radius } from "@/theme/tokens";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  accessibilityLabel?: string;
  panelWidth?: number;
  title?: string;
  showCloseButton?: boolean;
  panelStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const CustomModal = React.memo(function CustomModal({
  visible,
  onClose,
  accessibilityLabel = "Close modal",
  panelWidth = 400,
  title,
  showCloseButton = true,
  panelStyle,
  children,
}: CustomModalProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];

  const showHeader = showCloseButton || !!title;

  useEffect(() => {
    if (Platform.OS !== "web" || !visible) {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.bg.overlay }]}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        />
        <View
          style={[
            styles.panel,
            {
              width: panelWidth,
              backgroundColor: theme.bg.subtle,
              borderColor: theme.border.default,
            },
            panelStyle,
          ]}
        >
          {showHeader && (
            <View style={[styles.header, !!title && styles.headerWithTitle]}>
              {title ? (
                <Text style={[styles.title, { color: theme.text.primary }]}>
                  {title}
                </Text>
              ) : null}
              {showCloseButton && (
                <CustomButton
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <X size={16} color={theme.text.secondary} />
                </CustomButton>
              )}
            </View>
          )}
          <CustomList
            scrollViewProps={{
              style: styles.scrollContent,
              contentContainerStyle: styles.scrollContentContainer,
              showsVerticalScrollIndicator: false,
              bounces: false,
              keyboardShouldPersistTaps: "handled",
            }}
          >
            {children}
          </CustomList>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[20],
  },
  panel: {
    maxWidth: "100%",
    maxHeight: "90%",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing[16],
    gap: spacing[12],
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerWithTitle: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    flexShrink: 1,
  },
  scrollContentContainer: {
    flexGrow: 0,
  },
});
