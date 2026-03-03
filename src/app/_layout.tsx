import React from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { AppProviders } from "@/providers/AppProviders";

export default function RootLayout() {
  useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
  });

  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}
