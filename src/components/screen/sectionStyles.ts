import { StyleSheet } from "react-native";
import { spacing } from "@/theme/tokens";

export const sectionStyles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
  chartRow: {
    flexDirection: "row",
    gap: spacing[4],
  },
});
