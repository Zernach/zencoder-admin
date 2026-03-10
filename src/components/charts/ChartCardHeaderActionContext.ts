import React from "react";

export interface ChartCardHeaderActionContextValue {
  setHeaderAction: (action: React.ReactNode) => void;
}

export const ChartCardHeaderActionContext = React.createContext<ChartCardHeaderActionContextValue | null>(null);
