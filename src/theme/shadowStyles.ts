import type { ViewStyle } from "react-native";
import { shadowsByTheme, type ThemeName } from "./tokens";

type ShadowLevel = keyof (typeof shadowsByTheme)[ThemeName];

interface GetShadowStyleParams {
  themeName: ThemeName;
  level: ShadowLevel;
}

export function getShadowStyle({
  themeName,
  level,
}: GetShadowStyleParams): Pick<ViewStyle, "boxShadow" | "elevation"> {
  const shadowToken = shadowsByTheme[themeName][level];

  return {
    boxShadow: shadowToken.boxShadow,
    elevation: shadowToken.elevation,
  };
}
