import React from "react";
import { ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { useAppSelector } from "@/store/hooks";
import { selectIsLoading } from "@/store/slices/loadingSlice";

interface ReduxLoadingSpinnerProps {
  reduxKey: string;
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Spinner that automatically shows/hides based on a Redux loading key.
 * Reads `state.loading[reduxKey]` and renders an ActivityIndicator when true.
 */
function ReduxLoadingSpinner({
  reduxKey,
  size = "small",
  color = "#30a8dc",
  style,
}: ReduxLoadingSpinnerProps) {
  const isLoading = useAppSelector(selectIsLoading(reduxKey));

  if (!isLoading) return null;

  return (
    <ActivityIndicator
      size={size}
      color={color}
      style={style}
      accessibilityLabel="Loading"
    />
  );
}

export default ReduxLoadingSpinner;
