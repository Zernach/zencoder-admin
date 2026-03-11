import { TABS } from "@/constants/routes";

export interface SuggestedPrompt {
  label: string;
  message: string;
}

const DASHBOARD_PROMPTS: SuggestedPrompt[] = [
  {
    label: "How are my agents performing this week?",
    message: "How are my agents performing this week? Summarize success rates, error trends, and any standout agents.",
  },
  {
    label: "Show me today's activity summary",
    message: "Give me a summary of today's agent activity — runs, completions, failures, and anything unusual.",
  },
  {
    label: "Which teams are most active?",
    message: "Which teams have been most active recently? Show me a breakdown of agent usage by team.",
  },
  {
    label: "Any issues I should know about?",
    message: "Are there any issues or anomalies I should be aware of? Flag errors, spikes, or policy violations.",
  },
];

const AGENTS_PROMPTS: SuggestedPrompt[] = [
  {
    label: "Which agents have the most errors?",
    message: "Which agents have the highest error rates right now? List them with failure counts and recent trends.",
  },
  {
    label: "Compare top agents by success rate",
    message: "Compare my top agents by success rate this month. Show rankings and any notable changes.",
  },
  {
    label: "List inactive agents",
    message: "List agents that haven't had any runs in the past 7 days. Are any of them supposed to be active?",
  },
  {
    label: "Explain an agent's recent run history",
    message: "Pick the agent with the most interesting recent activity and walk me through its run history.",
  },
];

const COSTS_PROMPTS: SuggestedPrompt[] = [
  {
    label: "Where are costs trending upwards?",
    message: "Where are costs trending upward? Show me which agents or teams are driving the increase.",
  },
  {
    label: "Show cost breakdown by team",
    message: "Break down costs by team for this month. How does it compare to last month?",
  },
  {
    label: "Flag unusual spending",
    message: "Flag any unusual or unexpected spending patterns. Are there cost spikes I should investigate?",
  },
  {
    label: "How can I reduce costs?",
    message: "Analyze my current agent usage and suggest ways to reduce costs without impacting performance.",
  },
];

const GOVERNANCE_PROMPTS: SuggestedPrompt[] = [
  {
    label: "Any new policy violations?",
    message: "Are there any new policy violations since my last review? Summarize severity and affected agents.",
  },
  {
    label: "Show compliance summary",
    message: "Give me an overall compliance summary — how many rules are passing, failing, or need attention?",
  },
  {
    label: "List unresolved violations",
    message: "List all unresolved violations sorted by severity. Which ones should I prioritize?",
  },
  {
    label: "Review governance rules",
    message: "Walk me through the active governance rules. Are there any that haven't triggered recently?",
  },
];

const SETTINGS_PROMPTS: SuggestedPrompt[] = [
  {
    label: "How do I add a new team member?",
    message: "Walk me through adding a new team member and setting up their permissions.",
  },
  {
    label: "What integrations are available?",
    message: "What integrations are available for connecting to external tools and services?",
  },
  {
    label: "Review notification settings",
    message: "Show me my current notification settings. Am I missing any important alerts?",
  },
  {
    label: "Help me configure an agent",
    message: "Help me configure a new agent — what settings and parameters should I consider?",
  },
];

const PROMPTS_BY_TAB: Record<TABS, SuggestedPrompt[]> = {
  [TABS.DASHBOARD]: DASHBOARD_PROMPTS,
  [TABS.AGENTS]: AGENTS_PROMPTS,
  [TABS.COSTS]: COSTS_PROMPTS,
  [TABS.GOVERNANCE]: GOVERNANCE_PROMPTS,
  [TABS.SETTINGS]: SETTINGS_PROMPTS,
};

export function getSuggestedPrompts(tab: TABS): SuggestedPrompt[] {
  return PROMPTS_BY_TAB[tab];
}

export function getWelcomeTitle(): string {
  return "Hey! What can I help you with?";
}

export function getWelcomeSubtitle(tab: TABS): string {
  const subtitles: Record<TABS, string> = {
    [TABS.DASHBOARD]: "Ask about agent performance, activity trends, or get a quick status check.",
    [TABS.AGENTS]: "Dig into agent health, compare performance, or troubleshoot issues.",
    [TABS.COSTS]: "Explore spending patterns, find savings, or investigate cost spikes.",
    [TABS.GOVERNANCE]: "Check compliance status, review violations, or audit your policies.",
    [TABS.SETTINGS]: "Get help with configuration, integrations, or team management.",
  };
  return subtitles[tab];
}
