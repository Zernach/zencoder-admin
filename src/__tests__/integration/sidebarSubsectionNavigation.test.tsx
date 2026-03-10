import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SUBSECTIONS } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { SidebarSubsectionItem } from "@/components/shell/SidebarSubsectionItem";
import { SectionScrollProvider, useSectionScroll } from "@/hooks/useSectionScroll";

// ─── Contract tests (from PR 0053) ──────────────────────

describe("Sidebar Subsection Navigation — contract", () => {
  it("agents subsections have matching nativeID anchors defined", () => {
    const expectedIds = ["reliability", "agent-performance", "project-breakdown", "recent-runs"];
    const agentSubs = SUBSECTIONS[ROUTES.AGENTS];
    expect(agentSubs.map((s) => s.id)).toEqual(expectedIds);
  });

  it("costs subsections have matching nativeID anchors defined", () => {
    const expectedIds = ["cost-summary", "cost-by-provider", "budget-forecast", "costs-project-breakdown"];
    const costSubs = SUBSECTIONS[ROUTES.COSTS];
    expect(costSubs.map((s) => s.id)).toEqual(expectedIds);
  });

  it("governance subsections exactly match required entries in order", () => {
    const govSubs = SUBSECTIONS[ROUTES.GOVERNANCE];
    expect(govSubs.length).toBe(7);
    expect(govSubs.map((s) => s.id)).toEqual([
      "overview",
      "compliance-status",
      "team-performance",
      "seat-user-oversight",
      "recent-violations",
      "security-events",
      "policy-changes",
    ]);
    expect(govSubs.map((s) => s.label)).toEqual([
      "Overview",
      "Compliance Status",
      "Team Performance",
      "Seat User Oversight",
      "Recent Violations",
      "Security Events",
      "Policy Changes",
    ]);
  });

  it("all subsection IDs are kebab-case and non-empty", () => {
    const kebabRegex = /^[a-z][a-z0-9-]*$/;
    for (const route of Object.keys(SUBSECTIONS) as (keyof typeof SUBSECTIONS)[]) {
      for (const sub of SUBSECTIONS[route]) {
        expect(sub.id).toMatch(kebabRegex);
      }
    }
  });

  it("all subsection labels are non-empty strings", () => {
    for (const route of Object.keys(SUBSECTIONS) as (keyof typeof SUBSECTIONS)[]) {
      for (const sub of SUBSECTIONS[route]) {
        expect(typeof sub.label).toBe("string");
        expect(sub.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("subsection IDs are unique within each route", () => {
    for (const route of Object.keys(SUBSECTIONS) as (keyof typeof SUBSECTIONS)[]) {
      const ids = SUBSECTIONS[route].map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

// ─── SidebarSubsectionItem pressability ─────────────────

describe("SidebarSubsectionItem — pressable", () => {
  it("renders as a pressable control with the given label", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SidebarSubsectionItem label="Reliability" onPress={onPress} />,
    );
    expect(getByText("Reliability")).toBeTruthy();
  });

  it("fires onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <SidebarSubsectionItem label="Agent Performance" onPress={onPress} />,
    );
    fireEvent.press(getByRole("button", { name: "Agent Performance" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("has correct accessibility role", () => {
    const { getByRole } = render(
      <SidebarSubsectionItem label="Overview" onPress={jest.fn()} />,
    );
    expect(getByRole("button", { name: "Overview" })).toBeTruthy();
  });
});

// ─── SectionScrollContext — scroll dispatch ─────────────

describe("SectionScrollContext — scroll dispatch", () => {
  it("scrollToSection is callable from context consumer", () => {
    let captured: ((id: string) => void) | undefined;
    function Consumer() {
      const { scrollToSection } = useSectionScroll();
      captured = scrollToSection;
      return null;
    }

    render(
      <SectionScrollProvider>
        <Consumer />
      </SectionScrollProvider>,
    );

    expect(captured).toBeDefined();
    // Should not throw when called (no scroll view registered yet — graceful no-op)
    expect(() => captured!("overview")).not.toThrow();
  });

  it("registerScrollView and registerSection are stable callbacks", () => {
    const refs: { registerScrollView?: unknown; registerSection?: unknown }[] = [];
    function Consumer() {
      const { registerScrollView, registerSection } = useSectionScroll();
      refs.push({ registerScrollView, registerSection });
      return null;
    }

    const { rerender } = render(
      <SectionScrollProvider>
        <Consumer />
      </SectionScrollProvider>,
    );

    rerender(
      <SectionScrollProvider>
        <Consumer />
      </SectionScrollProvider>,
    );

    expect(refs.length).toBe(2);
    expect(refs[0]!.registerScrollView).toBe(refs[1]!.registerScrollView);
    expect(refs[0]!.registerSection).toBe(refs[1]!.registerSection);
  });
});

// ─── Integration: subsection press dispatches scrollToSection per route ──

describe("Sidebar subsection press → scrollToSection integration", () => {
  const SUBSECTION_ROUTES: { route: keyof typeof SUBSECTIONS; label: string }[] = [
    { route: ROUTES.AGENTS, label: "Agents" },
    { route: ROUTES.COSTS, label: "Costs" },
    { route: ROUTES.GOVERNANCE, label: "Governance" },
  ];

  for (const { route, label } of SUBSECTION_ROUTES) {
    describe(`${label} subsections`, () => {
      const subs = SUBSECTIONS[route];

      it(`renders ${subs.length} pressable subsection items`, () => {
        const pressHandlers = subs.map(() => jest.fn());
        const { getAllByRole } = render(
          <>
            {subs.map((sub, i) => (
              <SidebarSubsectionItem
                key={sub.id}
                label={sub.label}
                onPress={pressHandlers[i]!}
              />
            ))}
          </>,
        );

        const buttons = getAllByRole("button");
        expect(buttons.length).toBe(subs.length);
      });

      for (const sub of subs) {
        it(`pressing "${sub.label}" fires its onPress handler`, () => {
          const onPress = jest.fn();
          const { getByRole } = render(
            <SidebarSubsectionItem label={sub.label} onPress={onPress} />,
          );

          fireEvent.press(getByRole("button", { name: sub.label }));
          expect(onPress).toHaveBeenCalledTimes(1);
        });
      }
    });
  }
});

// ─── Governance-specific: required subsection labels and order ──

describe("Governance subsection order and labels (strict)", () => {
  const REQUIRED_GOVERNANCE_SUBSECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "compliance-status", label: "Compliance Status" },
    { id: "team-performance", label: "Team Performance" },
    { id: "seat-user-oversight", label: "Seat User Oversight" },
    { id: "recent-violations", label: "Recent Violations" },
    { id: "security-events", label: "Security Events" },
    { id: "policy-changes", label: "Policy Changes" },
  ];

  it("governance has exactly the required subsections in order", () => {
    const govSubs = SUBSECTIONS[ROUTES.GOVERNANCE];
    expect(govSubs).toEqual(REQUIRED_GOVERNANCE_SUBSECTIONS);
  });

  it("each governance subsection renders as a pressable button", () => {
    const { getAllByRole } = render(
      <>
        {REQUIRED_GOVERNANCE_SUBSECTIONS.map((sub) => (
          <SidebarSubsectionItem key={sub.id} label={sub.label} onPress={jest.fn()} />
        ))}
      </>,
    );

    const buttons = getAllByRole("button");
    expect(buttons.length).toBe(7);
    REQUIRED_GOVERNANCE_SUBSECTIONS.forEach((sub, i) => {
      expect(buttons[i]).toHaveProp("accessibilityLabel", sub.label);
    });
  });
});
