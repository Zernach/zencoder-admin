import React, { useEffect } from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { enableFreeze, enableScreens } from "react-native-screens";
import { View } from "react-native";
import { isWeb } from "@/constants/platform";
import { AppProviders } from "@/providers/AppProviders";

if (!isWeb) {
  enableScreens(true);
  enableFreeze(true);
}

type InlineStylePatch = ReadonlyArray<readonly [property: string, value: string]>;

const HTML_VIEWPORT_LOCK_STYLES: InlineStylePatch = [
  ["height", "100%"],
  ["overflow", "hidden"],
  ["overscroll-behavior", "none"],
];

const BODY_VIEWPORT_LOCK_STYLES: InlineStylePatch = [
  ["margin", "0"],
  ["padding", "0"],
  ["height", "100%"],
  ["width", "100%"],
  ["overflow", "hidden"],
  ["overscroll-behavior", "none"],
];

const ROOT_VIEWPORT_LOCK_STYLES: InlineStylePatch = [
  ["display", "flex"],
  ["height", "100%"],
  ["flex-direction", "column"],
  ["overflow", "hidden"],
];

function applyInlineStyles(
  element: HTMLElement,
  styles: InlineStylePatch,
): () => void {
  const previousStyles = styles.map(([property]) => [property, element.style.getPropertyValue(property)] as const);

  styles.forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });

  return () => {
    previousStyles.forEach(([property, value]) => {
      if (value) {
        element.style.setProperty(property, value);
        return;
      }
      element.style.removeProperty(property);
    });
  };
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Regular.otf"),
  });

  useEffect(() => {
    if (!isWeb || typeof document === "undefined") {
      return;
    }

    const cleanupFns: Array<() => void> = [
      applyInlineStyles(document.documentElement, HTML_VIEWPORT_LOCK_STYLES),
      applyInlineStyles(document.body, BODY_VIEWPORT_LOCK_STYLES),
    ];
    const rootElement = document.getElementById("root");

    if (rootElement instanceof HTMLElement) {
      cleanupFns.push(applyInlineStyles(rootElement, ROOT_VIEWPORT_LOCK_STYLES));
    }

    return () => {
      cleanupFns.reverse().forEach((cleanup) => cleanup());
    };
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#0a0a0a" }} />;
  }

  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
