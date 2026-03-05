import React from "react";
import { ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectIsLoading } from "@/store/slices/loadingSlice";
import { useThemeMode } from "@/providers/ThemeProvider";
import { semanticThemes } from "@/theme/themes";

interface ReduxLoadingSpinnerProps {
  reduxKey: string;
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
}

function ReduxLoadingSpinner({
  reduxKey,
  size = "small",
  color,
  style,
}: ReduxLoadingSpinnerProps) {
  const { mode } = useThemeMode();
  const theme = semanticThemes[mode];
  const isLoading = useAppSelector(selectIsLoading(reduxKey));
  const resolvedColor = color ?? theme.border.brand;

  if (!isLoading) return null;

  return (
    <ActivityIndicator
      size={size}
      color={resolvedColor}
      style={style}
      accessibilityLabel="Loading"
    />
  );
}

export default ReduxLoadingSpinner;
