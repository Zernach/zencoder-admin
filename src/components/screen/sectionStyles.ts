import { StyleSheet } from "react-native";
import { spacing } from "@/theme/tokens";

export const sectionStyles = StyleSheet.create({
  section: {
    gap: spacing[16],
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
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    overflow: "hidden",
  },
  chartCardScroll: {
    flexShrink: 1,
  },
  chartCardViewport: {
    alignSelf: "stretch",
  },
  /** Row layout for section header + action button (e.g. "+ Create …") */
  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: spacing[8],
  },
  sectionHeaderWrap: {
    flex: 1,
    minWidth: 0,
  },
  createButton: {
    marginLeft: "auto",
    flexShrink: 0,
    maxWidth: "100%",
  },
  createButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
