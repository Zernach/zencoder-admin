import React from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { enableFreeze, enableScreens } from "react-native-screens";
import { isWeb } from "@/constants/platform";
import { AppProviders } from "@/providers/AppProviders";

if (!isWeb) {
  enableScreens(true);
  enableFreeze(true);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require("../assets/fonts/Inter-Regular.otf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
