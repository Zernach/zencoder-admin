import { TABS } from "@/constants/routes";
import type { IChatApi } from "@/features/chat/api/IChatApi";
import {
  type ChatConversationStatus,
  type ChatConversationSummary,
  type ChatMessage,
  type ChatTopic,
  type CreateChatRequest,
  type CreateChatResponse,
  type GetChatHistoryRequest,
  type GetChatHistoryResponse,
  type GetChatThreadRequest,
  type GetChatThreadResponse,
  type MarkAsReadRequest,
  type MarkAsReadResponse,
  type SendMessageRequest,
  type SendMessageResponse,
} from "@/features/chat/types";
import { notFoundError, validationError } from "@/contracts/http/errors";

interface StubChatApiOptions {
  latencyMinMs?: number;
  latencyMaxMs?: number;
}

interface ConversationFixture {
  summary: ChatConversationSummary;
  messages: ChatMessage[];
}

interface ConversationTemplateMessage {
  role: "user" | "assistant";
  content: string;
}

interface ConversationTemplate {
  title: string;
  topics: ChatTopic[];
  status: ChatConversationStatus;
  unreadCount: number;
  startedMinutesAgo: number;
  gapMinutes: number;
  messages: ConversationTemplateMessage[];
}

const TEMPLATES_BY_TAB: Record<TABS, ConversationTemplate[]> = {
  [TABS.DASHBOARD]: [
    {
      title: "Q1 agent-run snapshot before board readout",
      topics: ["Support", "Costs"],
      status: "active",
      unreadCount: 2,
      startedMinutesAgo: 88,
      gapMinutes: 10,
      messages: [
        {
          role: "user",
          content:
            "I need a one-page snapshot: agent-run success rate, failures auto-resolved, and top 3 at-risk projects across teams for the last 7 days.",
        },
        {
          role: "assistant",
          content:
            "Drafted. Overall agent-run success rate is 94.2%, 312 failed runs auto-retried successfully, and the highest-risk projects are the Cellar Sync Engine, CI/CD Automation, and the Q3 Growth Campaign.",
        },
        {
          role: "user",
          content:
            "Add a callout for why Cellar Sync Engine risk went up this week.",
        },
        {
          role: "assistant",
          content:
            "Added: the Code Review Bot's average run duration grew 6 minutes after the Database Migration branch landed, and two of its API connectors are hitting rate limits.",
        },
      ],
    },
    {
      title: "Anomaly triage for Engineering agent-run failures",
      topics: ["Agents", "Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 305,
      gapMinutes: 12,
      messages: [
        {
          role: "user",
          content:
            "Engineering agent-run failures jumped this morning. Was this a model issue or an upstream connector problem?",
        },
        {
          role: "assistant",
          content:
            "Mostly upstream: 68% of failures traced to a GitHub API connector timeout on three high-volume agents. Model latency was within tolerance.",
        },
        {
          role: "user",
          content:
            "Which project was most affected?",
        },
        {
          role: "assistant",
          content:
            "The API Gateway Refactor contributed 42% of impacted runs. Suggest pausing the Test Generator agent for the next 72 hours while the connector recovers.",
        },
      ],
    },
    {
      title: "Weekly digest wording for executive Slack",
      topics: ["Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 980,
      gapMinutes: 18,
      messages: [
        {
          role: "user",
          content:
            "Rewrite the weekly update to be less technical for leadership. Keep three bullets and one action item.",
        },
        {
          role: "assistant",
          content:
            "Shared a plain-language version focused on agent-run reliability, failures avoided, and team spend trend. Action item: raise retry budgets for the Engineering team's deploy agents.",
        },
      ],
    },
    {
      title: "Follow-up after critical Deploy Bot run failure",
      topics: ["Agents", "Support"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 3240,
      gapMinutes: 22,
      messages: [
        {
          role: "user",
          content:
            "Capture what we learned from yesterday's Deploy Bot run failure on the Mobile App Build Pipeline and what we changed.",
        },
        {
          role: "assistant",
          content:
            "Summary prepared: root cause was a single-region dependency on one build runner, mitigation was failing over to a backup runner pool, and we added a 7-minute run-duration saturation alert for the Engineering team's deploy agents.",
        },
      ],
    },
  ],
  [TABS.AGENTS]: [
    {
      title: "Threshold tuning for Code Review Bot false flags",
      topics: ["Agents"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 55,
      gapMinutes: 9,
      messages: [
        {
          role: "user",
          content:
            "Should we tighten the Code Review Bot sensitivity? Engineering is noting too many low-impact flags on pull requests.",
        },
        {
          role: "assistant",
          content:
            "Recommend keeping HIGH severity threshold at 0.85 and raising MEDIUM to 0.65. That cuts noise 38% while preserving 99% of blocking-bug detections.",
        },
        {
          role: "user",
          content:
            "What if we scope tighter thresholds only to non-critical repositories?",
        },
        {
          role: "assistant",
          content:
            "Safer. Non-critical repo scoping adds only 1.8% missed-detection risk and avoids review fatigue for the Engineering team.",
        },
      ],
    },
    {
      title: "Failure category triage by workflow app",
      topics: ["Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 420,
      gapMinutes: 11,
      messages: [
        {
          role: "user",
          content:
            "Group failures by workflow app and show which categories are trending up week over week.",
        },
        {
          role: "assistant",
          content:
            "API connector timeouts are up 14% on the Asset Generator, and model rate-limit errors are up 9% on the Content Writer. Other categories are flat.",
        },
      ],
    },
    {
      title: "Run-queue optimization for the Engineering team",
      topics: ["Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 1460,
      gapMinutes: 15,
      messages: [
        {
          role: "user",
          content:
            "Test Generator run latency crossed 2 minutes again. Give me a concrete mitigation sequence.",
        },
        {
          role: "assistant",
          content:
            "Plan: reserve 15% burst capacity for the Engineering team's run queue, throttle stale CI/CD Automation polls every 30s, then run a two-hour canary before full rollout.",
        },
      ],
    },
    {
      title: "Connector fallback thresholds and guardrails",
      topics: ["Agents"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 3780,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "Document fallback triggers between the primary model endpoint and the secondary failover endpoint with rollback criteria.",
        },
        {
          role: "assistant",
          content:
            "Captured thresholds: failover at 2% sustained connector errors for 3 minutes, rollback after 20 minutes stable under 0.7% errors.",
        },
      ],
    },
  ],
  [TABS.COSTS]: [
    {
      title: "Root cause analysis for today's agent-run spend spike",
      topics: ["Costs"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 64,
      gapMinutes: 8,
      messages: [
        {
          role: "user",
          content:
            "Agent-run spend jumped 19% since Monday. What changed by team and project?",
        },
        {
          role: "assistant",
          content:
            "Primary driver is the Engineering team's Database Migration project, up $61k after the Refactor Agent retried long context windows on every failed run. Team mix is mostly constant.",
        },
        {
          role: "user",
          content:
            "Can we contain this this week without slowing down the migration?",
        },
        {
          role: "assistant",
          content:
            "Yes. Cap the Refactor Agent's retry budget and switch its non-critical runs to a smaller approved model for 7 days. Estimated week-over-week savings: $23k with no migration delay.",
        },
      ],
    },
    {
      title: "Forecast confidence for end-of-month team budget",
      topics: ["Costs", "Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 610,
      gapMinutes: 13,
      messages: [
        {
          role: "user",
          content:
            "Given current trend, are we likely to exceed this month's agent-run budget?",
        },
        {
          role: "assistant",
          content:
            "Projection lands at 94% of budget with medium confidence. Biggest risk is unplanned Asset Generator run volume from the Design team in week 4.",
        },
      ],
    },
    {
      title: "Agent-run cost reduction opportunities",
      topics: ["Costs", "Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 1710,
      gapMinutes: 17,
      messages: [
        {
          role: "user",
          content:
            "Find low-risk opportunities to reduce per-run cost across the Marketing team's agents.",
        },
        {
          role: "assistant",
          content:
            "Three opportunities identified: prompt trimming for 14 SEO Optimizer runs, a smaller-model swap on low-stakes Social Post Generator runs, and dropping duplicate Content Writer runs that retried >40% of the time. Combined savings ~7.4% per run.",
        },
      ],
    },
    {
      title: "Team spend split for budget review",
      topics: ["Costs"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 4320,
      gapMinutes: 24,
      messages: [
        {
          role: "user",
          content:
            "I need a team spend split summary for the budget review: spend, run success rate, and single-project concentration risk.",
        },
        {
          role: "assistant",
          content:
            "Prepared with a recommendation to spread workloads across projects. Engineering handles 71% of spend with the best run success rate, while Product keeps the most balanced project mix.",
        },
      ],
    },
  ],
  [TABS.GOVERNANCE]: [
    {
      title: "Approval exception request for a Production Access run",
      topics: ["Governance", "Support"],
      status: "active",
      unreadCount: 0,
      startedMinutesAgo: 140,
      gapMinutes: 9,
      messages: [
        {
          role: "user",
          content:
            "Can we approve a temporary Production Access Control exception for the Deploy Bot while we tune the Code Change Approval rule?",
        },
        {
          role: "assistant",
          content:
            "Possible with guardrails. Limit it to the Mobile App Build Pipeline project, require Engineering lead sign-off per run, and auto-expire in 14 days.",
        },
        {
          role: "user",
          content:
            "Add approval language for engineering and security leadership sign-off.",
        },
        {
          role: "assistant",
          content:
            "Added wording plus a rollback trigger: revoke immediately if any run trips the Agent Action Audit Trail rule with an unlogged action over 24 hours.",
        },
      ],
    },
    {
      title: "Violation trend analysis by compliance rule",
      topics: ["Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 730,
      gapMinutes: 14,
      messages: [
        {
          role: "user",
          content:
            "Break down violations by compliance rule and flag anything accelerating.",
        },
        {
          role: "assistant",
          content:
            "Sensitive Data Redaction and Approved Model Usage violations are rising fastest, up 18% and 11% week over week respectively.",
        },
      ],
    },
    {
      title: "Incident response timeline draft",
      topics: ["Governance", "Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2100,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "Draft a timeline for the agent-policy incident response with key checkpoints and owners across Engineering, Product, and security.",
        },
        {
          role: "assistant",
          content:
            "Timeline drafted with detection, run quarantine, stakeholder notification, and post-incident reporting milestones plus owner assignment for each phase.",
        },
      ],
    },
    {
      title: "Quarterly compliance audit prep",
      topics: ["Governance"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5100,
      gapMinutes: 28,
      messages: [
        {
          role: "user",
          content:
            "Assemble a concise compliance audit summary with policy coverage and exception counts.",
        },
        {
          role: "assistant",
          content:
            "Prepared and organized by rule family (Sensitive Data Redaction, Production Access Control, Brand & Content Safety), with exception aging and closure-rate trend included for the audit committee review.",
        },
      ],
    },
  ],
  [TABS.CHAT]: [
    {
      title: "Cross-team rollout for new Code Change Approval policy",
      topics: ["Support", "Governance"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 140,
      gapMinutes: 12,
      messages: [
        {
          role: "user",
          content:
            "Draft a rollout plan for the new Code Change Approval policy across all four teams.",
        },
        {
          role: "assistant",
          content:
            "Drafted with a staged rollout by team, Engineering and Product lead sign-off checkpoints, and weekly adoption review milestones.",
        },
      ],
    },
    {
      title: "Unified status update for leadership",
      topics: ["Agents", "Costs", "Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 780,
      gapMinutes: 16,
      messages: [
        {
          role: "user",
          content:
            "Create a concise update for leadership covering agent-run reliability, team spend, and compliance risk trends.",
        },
        {
          role: "assistant",
          content:
            "Prepared a three-part update summarizing run success drift, spend deltas vs. budget, and unresolved compliance violations with owners.",
        },
      ],
    },
    {
      title: "Onboarding checklist for a new team admin",
      topics: ["Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2310,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "I need a practical onboarding checklist for newly added team admins.",
        },
        {
          role: "assistant",
          content:
            "Checklist created with workspace access setup, alert preferences, agent-run dashboard review, and project ownership handoff.",
        },
      ],
    },
    {
      title: "Change communication for the API connector update",
      topics: ["Support"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5520,
      gapMinutes: 24,
      messages: [
        {
          role: "user",
          content:
            "Write a team-facing note about the upcoming API connector update and expected impact on agent runs.",
        },
        {
          role: "assistant",
          content:
            "Drafted communication with timeline, potential interruptions to agent-run scheduling, and support contacts for each team during migration.",
        },
      ],
    },
  ],
  [TABS.SETTINGS]: [
    {
      title: "Notification defaults cleanup for new teams",
      topics: ["Support"],
      status: "active",
      unreadCount: 0,
      startedMinutesAgo: 210,
      gapMinutes: 10,
      messages: [
        {
          role: "user",
          content:
            "Our new teams inherit noisy alert defaults. Suggest a cleaner baseline for team admins.",
        },
        {
          role: "assistant",
          content:
            "Recommended baseline: HIGH-severity agent-run failure alerts only, daily reliability digest at 07:00 local, and weekly team spend summary enabled.",
        },
      ],
    },
    {
      title: "Language rollout checklist for team dashboards",
      topics: ["Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 860,
      gapMinutes: 16,
      messages: [
        {
          role: "user",
          content:
            "Create a rollout checklist for enabling Spanish, French, and Italian across team-facing dashboards.",
        },
        {
          role: "assistant",
          content:
            "Checklist prepared with translation QA on agent and project terms, fallback locale behavior, and phased enablement by team.",
        },
      ],
    },
    {
      title: "Currency migration readiness for the Canadian team",
      topics: ["Support", "Costs"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2490,
      gapMinutes: 22,
      messages: [
        {
          role: "user",
          content:
            "Are we ready to switch default reporting currency to CAD for the Toronto-based team?",
        },
        {
          role: "assistant",
          content:
            "Almost. Conversion settings are in place, but two downstream cost-export jobs still assume USD labels.",
        },
      ],
    },
    {
      title: "Access control policy update for the Somm Assistant",
      topics: ["Support", "Governance"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5760,
      gapMinutes: 30,
      messages: [
        {
          role: "user",
          content:
            "Draft team-facing comms for upcoming Somm Assistant access changes and impact on existing super-users.",
        },
        {
          role: "assistant",
          content:
            "Draft created with timeline, affected roles, role-based migration guidance, and IT support path for blocked access.",
        },
      ],
    },
  ],
};

const TOPIC_BY_TAB: Record<Exclude<TABS, TABS.DASHBOARD>, ChatTopic> = {
  [TABS.AGENTS]: "Agents",
  [TABS.COSTS]: "Costs",
  [TABS.GOVERNANCE]: "Governance",
  [TABS.CHAT]: "Support",
  [TABS.SETTINGS]: "Support",
};

function subtractMinutes(now: Date, minutes: number): Date {
  return new Date(now.getTime() - minutes * 60_000);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function buildShortSummary(source: string): string {
  const words = source
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length >= 2) {
    return words.slice(0, Math.min(4, words.length)).join(" ");
  }

  if (words.length === 1) {
    return `${words[0]} overview`;
  }

  return "Chat overview";
}

function buildConversation(
  tab: TABS,
  index: number,
  template: ConversationTemplate,
  now: Date,
): ConversationFixture {
  const chatId = `${tab}-chat-${index + 1}`;
  const startedAt = subtractMinutes(now, template.startedMinutesAgo);
  const systemMessage: ChatMessage = {
    id: `${chatId}-m1`,
    chatId,
    role: "system",
    authorName: "System",
    content: `Cellar OS context loaded for ${tab} with team, project, and time-range filters.`,
    createdAtIso: startedAt.toISOString(),
  };
  const conversationMessages = template.messages.map((message, messageIndex) => {
    const createdAt = addMinutes(startedAt, (messageIndex + 1) * template.gapMinutes);
    return {
      id: `${chatId}-m${messageIndex + 2}`,
      chatId,
      role: message.role,
      authorName: message.role === "assistant" ? "Somm Assistant" : "Admin",
      content: message.content,
      createdAtIso: createdAt.toISOString(),
    } satisfies ChatMessage;
  });
  const messages: ChatMessage[] = [systemMessage, ...conversationMessages];

  const lastMessage = messages[messages.length - 1];

  return {
    summary: {
      id: chatId,
      tab,
      topics: template.topics,
      shortSummary: buildShortSummary(template.title),
      title: template.title,
      preview: lastMessage ? lastMessage.content : "",
      updatedAtIso: lastMessage ? lastMessage.createdAtIso : now.toISOString(),
      messageCount: messages.length,
      unreadCount: template.unreadCount,
      status: template.status,
    },
    messages,
  };
}

function buildFixtures(now: Date): Record<TABS, ConversationFixture[]> {
  return {
    [TABS.DASHBOARD]: TEMPLATES_BY_TAB[TABS.DASHBOARD].map((template, index) =>
      buildConversation(TABS.DASHBOARD, index, template, now),
    ),
    [TABS.AGENTS]: TEMPLATES_BY_TAB[TABS.AGENTS].map((template, index) =>
      buildConversation(TABS.AGENTS, index, template, now),
    ),
    [TABS.COSTS]: TEMPLATES_BY_TAB[TABS.COSTS].map((template, index) =>
      buildConversation(TABS.COSTS, index, template, now),
    ),
    [TABS.GOVERNANCE]: TEMPLATES_BY_TAB[TABS.GOVERNANCE].map((template, index) =>
      buildConversation(TABS.GOVERNANCE, index, template, now),
    ),
    [TABS.CHAT]: TEMPLATES_BY_TAB[TABS.CHAT].map((template, index) =>
      buildConversation(TABS.CHAT, index, template, now),
    ),
    [TABS.SETTINGS]: TEMPLATES_BY_TAB[TABS.SETTINGS].map((template, index) =>
      buildConversation(TABS.SETTINGS, index, template, now),
    ),
  };
}

export class StubChatApi implements IChatApi {
  private readonly options: Required<StubChatApiOptions>;

  private readonly fixturesByTab: Record<TABS, ConversationFixture[]>;

  constructor(options: StubChatApiOptions = {}) {
    const requestedMin = options.latencyMinMs ?? 80;
    const requestedMax = options.latencyMaxMs ?? 240;
    const latencyMinMs = Math.max(0, Math.min(requestedMin, requestedMax));
    const latencyMaxMs = Math.max(latencyMinMs, requestedMin, requestedMax, 0);

    this.options = {
      latencyMinMs,
      latencyMaxMs,
    };

    this.fixturesByTab = buildFixtures(new Date());
  }

  private assertOrgId(orgId: string): void {
    if (orgId.trim().length === 0) {
      throw validationError("orgId is required", [
        { field: "orgId", code: "required", message: "Provide a non-empty orgId." },
      ]);
    }
  }

  async getChatHistory(request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    await this.simulateLatency();
    this.assertOrgId(request.orgId);

    const fixturesSource = request.scope === "all"
      ? this.getAllFixtures()
      : this.fixturesByTab[request.tab];

    const fixtures = [...fixturesSource].sort((left, right) =>
      right.summary.updatedAtIso.localeCompare(left.summary.updatedAtIso),
    );

    const offset = request.cursor ? Number.parseInt(request.cursor, 10) : 0;
    if (offset < 0 || Number.isNaN(offset)) {
      throw validationError("cursor must be a non-negative integer string", [
        {
          field: "cursor",
          code: "invalid_format",
          message: "Expected cursor to be an encoded numeric offset.",
        },
      ]);
    }

    const requestedLimit = request.limit;
    const appliedLimit = typeof requestedLimit === "number"
      ? Math.max(1, Math.floor(requestedLimit))
      : fixtures.length;
    const nextCursor =
      offset + appliedLimit < fixtures.length ? String(offset + appliedLimit) : undefined;

    return {
      items: fixtures.slice(offset, offset + appliedLimit).map((fixture) => ({ ...fixture.summary })),
      totalCount: fixtures.length,
      nextCursor,
    };
  }

  async getChatThread(request: GetChatThreadRequest): Promise<GetChatThreadResponse> {
    await this.simulateLatency();
    this.assertOrgId(request.orgId);

    const conversation =
      this.fixturesByTab[request.tab].find(
        (fixture) => fixture.summary.id === request.chatId,
      ) ??
      this.getAllFixtures().find(
        (fixture) => fixture.summary.id === request.chatId,
      );

    if (!conversation) {
      throw notFoundError("Chat", request.chatId);
    }

    return {
      chat: { ...conversation.summary },
      messages: conversation.messages.map((message) => ({ ...message })),
    };
  }

  async createChat(request: CreateChatRequest): Promise<CreateChatResponse> {
    await this.simulateLatency();
    this.assertOrgId(request.orgId);

    const now = new Date();
    const chatId = `${request.tab}-chat-${Date.now()}`;
    const topic: ChatTopic = TOPIC_BY_TAB[request.tab as Exclude<TABS, TABS.DASHBOARD>] ?? "Support";

    const systemMessage: ChatMessage = {
      id: `${chatId}-m1`,
      chatId,
      role: "system",
      authorName: "System",
      content: `Cellar OS initialized for ${request.tab} agent-run workflows.`,
      createdAtIso: now.toISOString(),
    };

    const userMessage: ChatMessage = {
      id: `${chatId}-m2`,
      chatId,
      role: "user",
      authorName: "Admin",
      content: request.firstMessage,
      createdAtIso: now.toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: `${chatId}-m3`,
      chatId,
      role: "assistant",
      authorName: "Somm Assistant",
      content: this.pickStubResponse(),
      createdAtIso: new Date(now.getTime() + 100).toISOString(),
    };

    const summary: ChatConversationSummary = {
      id: chatId,
      tab: request.tab,
      topics: [topic],
      shortSummary: buildShortSummary(request.title || request.firstMessage),
      title: request.title,
      preview: assistantMessage.content,
      updatedAtIso: assistantMessage.createdAtIso,
      messageCount: 3,
      unreadCount: 0,
      status: "active",
    };

    const fixture: ConversationFixture = {
      summary,
      messages: [systemMessage, userMessage, assistantMessage],
    };

    const tabFixtures = this.fixturesByTab[request.tab];
    tabFixtures.unshift(fixture);

    return { chat: { ...summary } };
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // Simulate longer "AI thinking" latency
    await this.simulateThinkingLatency();
    this.assertOrgId(request.orgId);

    const now = new Date();
    const userMessage: ChatMessage = {
      id: `${request.chatId}-m${Date.now()}`,
      chatId: request.chatId,
      role: "user",
      authorName: "Admin",
      content: request.content,
      createdAtIso: now.toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: `${request.chatId}-m${Date.now() + 1}`,
      chatId: request.chatId,
      role: "assistant",
      authorName: "Somm Assistant",
      content: this.pickStubResponse(),
      createdAtIso: new Date(now.getTime() + 100).toISOString(),
    };

    // Append to the fixture so the thread stays consistent
    const conversation =
      this.fixturesByTab[request.tab].find(
        (f) => f.summary.id === request.chatId,
      ) ??
      this.getAllFixtures().find(
        (f) => f.summary.id === request.chatId,
      );
    if (!conversation) {
      throw notFoundError("Chat", request.chatId);
    }
    conversation.messages.push(userMessage, assistantMessage);
    conversation.summary.messageCount += 2;
    conversation.summary.updatedAtIso = assistantMessage.createdAtIso;

    return { userMessage, assistantMessage };
  }

  async markAsRead(request: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    await this.simulateLatency();
    this.assertOrgId(request.orgId);

    const conversation =
      this.fixturesByTab[request.tab].find(
        (f) => f.summary.id === request.chatId,
      ) ??
      this.getAllFixtures().find(
        (f) => f.summary.id === request.chatId,
      );

    if (!conversation) {
      throw notFoundError("Chat", request.chatId);
    }
    conversation.summary.unreadCount = 0;

    return { success: true };
  }

  private getAllFixtures(): ConversationFixture[] {
    return [
      ...this.fixturesByTab[TABS.DASHBOARD],
      ...this.fixturesByTab[TABS.AGENTS],
      ...this.fixturesByTab[TABS.COSTS],
      ...this.fixturesByTab[TABS.GOVERNANCE],
      ...this.fixturesByTab[TABS.CHAT],
      ...this.fixturesByTab[TABS.SETTINGS],
    ];
  }

  private async simulateLatency(): Promise<void> {
    const spread = Math.max(0, this.options.latencyMaxMs - this.options.latencyMinMs);
    const delayMs = this.options.latencyMinMs + Math.round(Math.random() * spread);

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), delayMs);
    });
  }

  private async simulateThinkingLatency(): Promise<void> {
    const delayMs = 1200 + Math.round(Math.random() * 800);
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), delayMs);
    });
  }

  private stubResponseIndex = 0;

  private pickStubResponse(): string {
    const responses = [
      "Great topic! This is a demo environment though, so the AI chat is stubbed out. In production, Somm would pull live data from your agent runs, workflow apps, and team dashboards to give you a real answer.",
      "Interesting question! Since this is a demo, I can't fetch real agent-run data right now. In the full version, I'd analyze your run success rates, failure signals, and team spend to provide actionable insights.",
      "Good discussion point! The chat feature is running in demo mode, so my responses are pre-written. The production version connects to your live CellarTracker Cellar OS workspace.",
      "I appreciate the question! This is a stubbed demo, but in a real deployment I'd have full access to your dashboards, workflow apps, and agent-run cost data to help you out.",
    ];
    const response = responses[this.stubResponseIndex % responses.length]!;
    this.stubResponseIndex += 1;
    return response;
  }
}
