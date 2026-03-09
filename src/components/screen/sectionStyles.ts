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
  chartRowFill: {
    minWidth: "100%",
  },
  chartCardFill: {
    flex: 1,
    minWidth: 0,
  },
});
