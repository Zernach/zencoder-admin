import type { NavigationState, PartialState } from "@react-navigation/native";
import { STACKS, TABS } from "@/constants/routes";
import { navigationStateToSegments } from "../navigationStateSegments";

function createState(
  state: PartialState<NavigationState>,
): PartialState<NavigationState> {
  return state;
}

describe("navigationStateToSegments", () => {
  it("returns stack fallback when no routes are available", () => {
    const state = createState({ routes: [] });

    expect(navigationStateToSegments(state)).toEqual([STACKS.DASHBOARD]);
  });

  it("maps active tab and nested stack route names into segments", () => {
    const state = createState({
      index: 1,
      routes: [
        { key: "dashboard-tab", name: TABS.DASHBOARD },
        {
          key: "agents-tab",
          name: TABS.AGENTS,
          state: createState({
            index: 1,
            routes: [
              { key: "agents-index", name: "index" },
              { key: "agent-team", name: "team/[teamId]" },
            ],
          }),
        },
      ],
    });

    expect(navigationStateToSegments(state)).toEqual([
      STACKS.DASHBOARD,
      TABS.AGENTS,
      "team",
      "[teamId]",
    ]);
  });

  it("does not duplicate dashboard stack segment when already present", () => {
    const state = createState({
      routes: [{ key: "dashboard-stack", name: `${STACKS.DASHBOARD}/${TABS.SETTINGS}` }],
    });

    expect(navigationStateToSegments(state)).toEqual([
      STACKS.DASHBOARD,
      TABS.SETTINGS,
    ]);
  });
});
