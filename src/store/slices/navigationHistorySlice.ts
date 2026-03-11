import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { TABS, resolveTabFromSegments } from "@/constants/routes";

function areSegmentsEqual(
  currentSegments: readonly string[],
  nextSegments: readonly string[],
): boolean {
  if (currentSegments.length !== nextSegments.length) {
    return false;
  }

  for (let index = 0; index < currentSegments.length; index += 1) {
    if (currentSegments[index] !== nextSegments[index]) {
      return false;
    }
  }

  return true;
}

export interface NavigationHistoryState {
  currentSegments: string[];
  previousSegments: string[];
  mostRecentTab: TABS;
}

const initialState: NavigationHistoryState = {
  currentSegments: [],
  previousSegments: [],
  mostRecentTab: TABS.DASHBOARD,
};

export const navigationHistorySlice = createSlice({
  name: "navigationHistory",
  initialState,
  reducers: {
    setCurrentSegments(state, action: PayloadAction<string[]>) {
      const nextSegments = action.payload;
      if (areSegmentsEqual(state.currentSegments, nextSegments)) {
        return;
      }

      state.previousSegments = state.currentSegments;
      state.currentSegments = nextSegments;
      const mostRecentTab = resolveTabFromSegments(nextSegments);
      if (mostRecentTab != null && mostRecentTab !== TABS.CHAT) {
        state.mostRecentTab = mostRecentTab;
      }
    },
  },
});

export const { setCurrentSegments } = navigationHistorySlice.actions;

export const selectCurrentSegments = (state: {
  navigationHistory: NavigationHistoryState;
}): string[] => state.navigationHistory.currentSegments;

export const selectPreviousSegments = (state: {
  navigationHistory: NavigationHistoryState;
}): string[] => state.navigationHistory.previousSegments;

export const selectMostRecentTab = (state: {
  navigationHistory: NavigationHistoryState;
}): TABS => state.navigationHistory.mostRecentTab;
