import React from "react";
import { Slot } from "expo-router";
import { DashboardShell } from "@/components/shell";

export default function DashboardLayout() {
  return (
    <DashboardShell>
      <Slot />
    </DashboardShell>
  );
}
