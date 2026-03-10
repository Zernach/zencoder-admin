import { StyleSheet } from "react-native";
import { spacing } from "@/theme/tokens";

export const sectionStyles = StyleSheet.create({
  section: {
    gap: spacing[12],
  },
  chartRow: {
    flexDirection: "row",
    gap: spacing[16],
  },
  chartRowFill: {
    width: "100%",
    alignSelf: "stretch",
  },
  chartCardFill: {
    flex: 1,
    minWidth: 0,
  },
  chartCardViewport: {
    alignSelf: "stretch",
  },
});
