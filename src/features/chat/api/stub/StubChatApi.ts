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
      title: "Q1 executive snapshot before board readout",
      topics: ["Support", "Costs"],
      status: "active",
      unreadCount: 2,
      startedMinutesAgo: 88,
      gapMinutes: 10,
      messages: [
        {
          role: "user",
          content:
            "I need a one-page snapshot: run success rate, total cost, and top 3 risky teams for the last 7 days.",
        },
        {
          role: "assistant",
          content:
            "Drafted. Success rate is 97.6%, spend is $182,340, and the highest-risk teams are Payments Ops, Claims Intake, and Customer Automation.",
        },
        {
          role: "user",
          content:
            "Add a callout for why Payments Ops risk went up this week.",
        },
        {
          role: "assistant",
          content:
            "Added: policy bypass attempts increased 31% after the provider failover on Tuesday, which raised manual review volume.",
        },
      ],
    },
    {
      title: "KPI anomaly triage for failed checkouts",
      topics: ["Agents", "Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 305,
      gapMinutes: 12,
      messages: [
        {
          role: "user",
          content:
            "Checkout failure rate jumped this morning. Can you isolate whether this is model quality or policy blocks?",
        },
        {
          role: "assistant",
          content:
            "Most of the spike is policy-related: 68% of failed runs were blocked by the high-risk card rule, not generation quality regressions.",
        },
        {
          role: "user",
          content:
            "Which project contributed the most?",
        },
        {
          role: "assistant",
          content:
            "Checkout Assist - EU contributed 42% of blocked runs. Suggest temporarily lowering strictness for known low-risk merchants.",
        },
      ],
    },
    {
      title: "Weekly digest wording for leadership Slack",
      topics: ["Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 980,
      gapMinutes: 18,
      messages: [
        {
          role: "user",
          content:
            "Rewrite the weekly update to be less technical. Keep three bullets and one action item.",
        },
        {
          role: "assistant",
          content:
            "Shared a plain-language version focused on reliability, customer impact, and spend trend. Added action item to expand canary coverage.",
        },
      ],
    },
    {
      title: "Follow-up after live assistant timeout incident",
      topics: ["Agents", "Support"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 3240,
      gapMinutes: 22,
      messages: [
        {
          role: "user",
          content:
            "Capture what we learned from yesterday's timeout incident and what we changed.",
        },
        {
          role: "assistant",
          content:
            "Summary prepared: root cause was queue saturation in us-east, mitigation was retry backoff + queue cap, and we added a 5-minute saturation alert.",
        },
      ],
    },
  ],
  [TABS.AGENTS]: [
    {
      title: "Retry policy tuning for Agent-ops-router",
      topics: ["Agents"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 55,
      gapMinutes: 9,
      messages: [
        {
          role: "user",
          content:
            "Should we increase retries from 2 to 3 for agent-ops-router given the overnight 5xx burst?",
        },
        {
          role: "assistant",
          content:
            "Recommend keeping max retries at 2 and adding jittered backoff. Going to 3 improves completion only 0.6% but increases P95 latency by 11%.",
        },
        {
          role: "user",
          content:
            "What if we scope that change only to low-priority queues?",
        },
        {
          role: "assistant",
          content:
            "That is safer. Low-priority only adds 1.8% cost and avoids customer-facing latency impact.",
        },
      ],
    },
    {
      title: "Failure category triage by model family",
      topics: ["Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 420,
      gapMinutes: 11,
      messages: [
        {
          role: "user",
          content:
            "Group failures by model family and show which categories are trending up week over week.",
        },
        {
          role: "assistant",
          content:
            "Reasoning failure is up 14% on alpha-3-small, while schema mismatch is up 9% on beta-2-fast. Other categories are flat.",
        },
      ],
    },
    {
      title: "Queue wait optimization plan for APAC",
      topics: ["Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 1460,
      gapMinutes: 15,
      messages: [
        {
          role: "user",
          content:
            "APAC queue wait crossed 2s again. Give me a concrete mitigation sequence.",
        },
        {
          role: "assistant",
          content:
            "Plan: reserve 15% burst capacity for APAC, rebalance stale jobs every 30s, then run a two-hour canary before full rollout.",
        },
      ],
    },
    {
      title: "Provider fallback thresholds and guardrails",
      topics: ["Agents"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 3780,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "Document fallback triggers between primary and secondary providers with rollback criteria.",
        },
        {
          role: "assistant",
          content:
            "Captured thresholds: failover at 2% sustained errors for 3 minutes, rollback after 20 minutes stable under 0.7% errors.",
        },
      ],
    },
  ],
  [TABS.COSTS]: [
    {
      title: "Root cause analysis for today's spend spike",
      topics: ["Costs"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 64,
      gapMinutes: 8,
      messages: [
        {
          role: "user",
          content:
            "Costs jumped 19% since 09:00. What changed by project and model?",
        },
        {
          role: "assistant",
          content:
            "Primary driver is Claims Intake, up $6.1k due to context window growth after prompt expansion. Model mix stayed mostly constant.",
        },
        {
          role: "user",
          content:
            "Can we contain this today without breaking response quality?",
        },
        {
          role: "assistant",
          content:
            "Yes. Trim retrieval chunks from 10 to 6 and cap assistant response length to 700 tokens for that flow. Estimated same-day savings: $2.3k.",
        },
      ],
    },
    {
      title: "Forecast confidence for end-of-month budget",
      topics: ["Costs", "Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 610,
      gapMinutes: 13,
      messages: [
        {
          role: "user",
          content:
            "Given current trend, are we likely to exceed this month's budget?",
        },
        {
          role: "assistant",
          content:
            "Projection lands at 94% of budget with medium confidence. Biggest risk is weekend promotional traffic in support workflows.",
        },
      ],
    },
    {
      title: "Token efficiency opportunities in support flows",
      topics: ["Costs", "Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 1710,
      gapMinutes: 17,
      messages: [
        {
          role: "user",
          content:
            "Find low-risk opportunities to reduce tokens in support conversations.",
        },
        {
          role: "assistant",
          content:
            "Three opportunities identified: shorter system preamble, deduplicated citations, and answer template compression. Combined savings around 7.4%.",
        },
      ],
    },
    {
      title: "Provider spend split for procurement review",
      topics: ["Costs"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 4320,
      gapMinutes: 24,
      messages: [
        {
          role: "user",
          content:
            "I need a provider split summary for procurement: spend, reliability, and lock-in risk.",
        },
        {
          role: "assistant",
          content:
            "Prepared with recommendation to keep dual-provider strategy. Primary handles 71% spend with best reliability, secondary maintains failover resilience.",
        },
      ],
    },
  ],
  [TABS.GOVERNANCE]: [
    {
      title: "Policy exception request for enterprise rollout",
      topics: ["Governance", "Support"],
      status: "active",
      unreadCount: 0,
      startedMinutesAgo: 140,
      gapMinutes: 9,
      messages: [
        {
          role: "user",
          content:
            "Can we approve a temporary exception for enterprise onboarding while we tune the PII detector?",
        },
        {
          role: "assistant",
          content:
            "Possible with guardrails. Limit to allowlisted accounts, enforce human review, and auto-expire in 14 days.",
        },
        {
          role: "user",
          content:
            "Add approval language for legal and security sign-off.",
        },
        {
          role: "assistant",
          content:
            "Added wording plus rollback trigger: revoke immediately if false-negative rate exceeds 0.5% over 24 hours.",
        },
      ],
    },
    {
      title: "Violation trend analysis by policy class",
      topics: ["Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 730,
      gapMinutes: 14,
      messages: [
        {
          role: "user",
          content:
            "Break down violations by policy class and flag anything accelerating.",
        },
        {
          role: "assistant",
          content:
            "Prompt injection and unsafe external link classes are rising fastest, up 18% and 11% week over week respectively.",
        },
      ],
    },
    {
      title: "Security escalation timeline draft",
      topics: ["Governance", "Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2100,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "Draft a timeline for the security incident review with key checkpoints and owners.",
        },
        {
          role: "assistant",
          content:
            "Timeline drafted with detection, containment, remediation, and postmortem milestones plus owner assignment for each phase.",
        },
      ],
    },
    {
      title: "Quarterly audit summary prep",
      topics: ["Governance"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5100,
      gapMinutes: 28,
      messages: [
        {
          role: "user",
          content:
            "Assemble a concise quarterly audit summary with policy coverage and exception counts.",
        },
        {
          role: "assistant",
          content:
            "Prepared and organized by control family, with exception aging and closure-rate trend included for audit committee review.",
        },
      ],
    },
  ],
  [TABS.SETTINGS]: [
    {
      title: "Workspace defaults cleanup for new teams",
      topics: ["Support"],
      status: "active",
      unreadCount: 0,
      startedMinutesAgo: 210,
      gapMinutes: 10,
      messages: [
        {
          role: "user",
          content:
            "Our new teams inherit noisy notification defaults. Suggest a cleaner baseline profile.",
        },
        {
          role: "assistant",
          content:
            "Recommended baseline: critical alerts only, daily digest at 09:00 local time, and weekly cost summary enabled.",
        },
      ],
    },
    {
      title: "Language rollout checklist for EMEA",
      topics: ["Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 860,
      gapMinutes: 16,
      messages: [
        {
          role: "user",
          content:
            "Create a rollout checklist for enabling French, German, and Spanish across the org.",
        },
        {
          role: "assistant",
          content:
            "Checklist prepared with translation QA, fallback locale behavior, and phased enablement by team.",
        },
      ],
    },
    {
      title: "Currency migration readiness review",
      topics: ["Support", "Costs"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2490,
      gapMinutes: 22,
      messages: [
        {
          role: "user",
          content:
            "Are we ready to switch default reporting currency to EUR for the parent workspace?",
        },
        {
          role: "assistant",
          content:
            "Almost. Conversion settings are in place, but two downstream exports still assume USD labels.",
        },
      ],
    },
    {
      title: "Access control policy update and communication",
      topics: ["Support", "Governance"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5760,
      gapMinutes: 30,
      messages: [
        {
          role: "user",
          content:
            "Draft user-facing comms for upcoming access control changes and impact on legacy admins.",
        },
        {
          role: "assistant",
          content:
            "Draft created with timeline, affected roles, migration guidance, and support escalation path for blocked access.",
        },
      ],
    },
  ],
};

const TOPIC_BY_TAB: Record<Exclude<TABS, TABS.DASHBOARD>, ChatTopic> = {
  [TABS.AGENTS]: "Agents",
  [TABS.COSTS]: "Costs",
  [TABS.GOVERNANCE]: "Governance",
  [TABS.SETTINGS]: "Support",
};

function subtractMinutes(now: Date, minutes: number): Date {
  return new Date(now.getTime() - minutes * 60_000);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
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
    content: `Workspace context loaded for ${tab} with team, project, and time-range filters.`,
    createdAtIso: startedAt.toISOString(),
  };
  const conversationMessages = template.messages.map((message, messageIndex) => {
    const createdAt = addMinutes(startedAt, (messageIndex + 1) * template.gapMinutes);
    return {
      id: `${chatId}-m${messageIndex + 2}`,
      chatId,
      role: message.role,
      authorName: message.role === "assistant" ? "Zencoder Assistant" : "Admin",
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

    const conversation = this.fixturesByTab[request.tab].find(
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
      content: `Context initialized for ${request.tab} workflows.`,
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
      authorName: "Zencoder Assistant",
      content: this.pickStubResponse(),
      createdAtIso: new Date(now.getTime() + 100).toISOString(),
    };

    const summary: ChatConversationSummary = {
      id: chatId,
      tab: request.tab,
      topics: [topic],
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
      authorName: "Zencoder Assistant",
      content: this.pickStubResponse(),
      createdAtIso: new Date(now.getTime() + 100).toISOString(),
    };

    // Append to the fixture so the thread stays consistent
    const conversation = this.fixturesByTab[request.tab].find(
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

    const conversation = this.fixturesByTab[request.tab].find(
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
      "Great topic! This is a demo environment though, so the AI chat is stubbed out. In production, I'd pull live data from your Zencoder workspace to give you a real answer.",
      "Interesting question! Since this is a demo, I can't fetch real data right now. In the full version, I'd analyze your metrics and provide actionable insights.",
      "Good discussion point! The chat feature is running in demo mode, so my responses are pre-written. The production version will connect to your live Zencoder data.",
      "I appreciate the question! This is a stubbed demo, but in a real deployment I'd have full access to your dashboards, agents, and cost data to help you out.",
    ];
    const response = responses[this.stubResponseIndex % responses.length]!;
    this.stubResponseIndex += 1;
    return response;
  }
}
