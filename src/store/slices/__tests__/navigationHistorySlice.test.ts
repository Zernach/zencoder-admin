import {
  navigationHistorySlice,
  setCurrentSegments,
  selectCurrentSegments,
  selectPreviousSegments,
  selectMostRecentTab,
  type NavigationHistoryState,
} from "../navigationHistorySlice";
import { TABS } from "@/constants/routes";

describe("navigationHistorySlice", () => {
  it("tracks current and previous segments", () => {
    const firstState = navigationHistorySlice.reducer(
      undefined,
      setCurrentSegments(["(dashboard)", "dashboard"]),
    );
    const secondState = navigationHistorySlice.reducer(
      firstState,
      setCurrentSegments(["(dashboard)", "dashboard", "agent", "[agentId]"]),
    );

    expect(secondState.currentSegments).toEqual(["(dashboard)", "dashboard", "agent", "[agentId]"]);
    expect(secondState.previousSegments).toEqual(["(dashboard)", "dashboard"]);
  });

  it("updates mostRecentTab when a tab segment exists", () => {
    const state = navigationHistorySlice.reducer(
      undefined,
      setCurrentSegments(["(dashboard)", "governance", "team", "[teamId]"]),
    );

    expect(state.mostRecentTab).toBe(TABS.GOVERNANCE);
  });

  it("keeps previousSegments stable when updating with identical segments", () => {
    const firstState = navigationHistorySlice.reducer(
      undefined,
      setCurrentSegments(["(dashboard)", "dashboard"]),
    );
    const secondState = navigationHistorySlice.reducer(
      firstState,
      setCurrentSegments(["(dashboard)", "dashboard"]),
    );

    expect(secondState).toBe(firstState);
    expect(secondState.previousSegments).toEqual([]);
  });

  it("does not overwrite mostRecentTab when current tab is chat", () => {
    const withKnownTab = navigationHistorySlice.reducer(
      undefined,
      setCurrentSegments(["(dashboard)", "agents"]),
    );
    const withChatRoute = navigationHistorySlice.reducer(
      withKnownTab,
      setCurrentSegments(["(dashboard)", "chat"]),
    );

    expect(withChatRoute.mostRecentTab).toBe(TABS.AGENTS);
  });

  it("keeps the last known tab when segments do not include a tab", () => {
    const withKnownTab = navigationHistorySlice.reducer(
      undefined,
      setCurrentSegments(["(dashboard)", "settings"]),
    );
    const withUnknownSegments = navigationHistorySlice.reducer(
      withKnownTab,
      setCurrentSegments(["auth", "login"]),
    );

    expect(withUnknownSegments.mostRecentTab).toBe(TABS.SETTINGS);
  });

  it("exposes selectors for navigation history state", () => {
    const navigationHistory: NavigationHistoryState = {
      currentSegments: ["(dashboard)", "costs"],
      previousSegments: ["(dashboard)", "dashboard"],
      mostRecentTab: TABS.COSTS,
    };

    const state = { navigationHistory };

    expect(selectCurrentSegments(state)).toEqual(["(dashboard)", "costs"]);
    expect(selectPreviousSegments(state)).toEqual(["(dashboard)", "dashboard"]);
    expect(selectMostRecentTab(state)).toBe(TABS.COSTS);
  });
});
