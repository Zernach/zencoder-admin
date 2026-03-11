import { TABS } from "@/constants/routes";
import type { IChatApi } from "@/features/chat/api/IChatApi";
import {
  CHAT_TOPICS,
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

interface StubChatApiOptions {
  latencyMinMs?: number;
  latencyMaxMs?: number;
}

interface ConversationFixture {
  summary: ChatConversationSummary;
  messages: ChatMessage[];
}

const TOPICS_BY_TAB: Record<TABS, string[]> = {
  [TABS.DASHBOARD]: [
    "Dashboard rollout summary",
    "KPI anomaly investigation",
    "Executive weekly digest",
    "Live assistant incident follow-up",
  ],
  [TABS.AGENTS]: [
    "Agent retry strategy tuning",
    "Failure category triage",
    "Queue wait optimization",
    "Model provider fallback plan",
  ],
  [TABS.COSTS]: [
    "Cost spike root-cause",
    "Monthly budget forecast",
    "Token efficiency opportunities",
    "Provider spend split review",
  ],
  [TABS.GOVERNANCE]: [
    "Policy exception review",
    "Violation trend analysis",
    "Security event escalation",
    "Audit summary prep",
  ],
  [TABS.SETTINGS]: [
    "Workspace defaults cleanup",
    "Language preference rollout",
    "Currency migration checklist",
    "Access control update",
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

function buildConversation(
  tab: TABS,
  index: number,
  topics: ChatTopic[],
  title: string,
  now: Date,
): ConversationFixture {
  const chatId = `${tab}-chat-${index + 1}`;
  const openedAt = subtractMinutes(now, 240 + index * 65);
  const questionAt = subtractMinutes(now, 80 + index * 18);
  const answerAt = subtractMinutes(now, 45 + index * 12);
  const followupAt = subtractMinutes(now, 20 + index * 7);

  const messages: ChatMessage[] = [
    {
      id: `${chatId}-m1`,
      chatId,
      role: "system",
      authorName: "System",
      content: `Context initialized for ${tab} workflows and current filters.`,
      createdAtIso: openedAt.toISOString(),
    },
    {
      id: `${chatId}-m2`,
      chatId,
      role: "user",
      authorName: "Admin",
      content: `Help me evaluate: ${title.toLowerCase()}.`,
      createdAtIso: questionAt.toISOString(),
    },
    {
      id: `${chatId}-m3`,
      chatId,
      role: "assistant",
      authorName: "Zencoder Assistant",
      content: "I prepared a concise analysis with impact, confidence, and next-step recommendations.",
      createdAtIso: answerAt.toISOString(),
    },
    {
      id: `${chatId}-m4`,
      chatId,
      role: "assistant",
      authorName: "Zencoder Assistant",
      content: "Would you like me to export this as an action checklist for your team?",
      createdAtIso: followupAt.toISOString(),
    },
  ];

  const lastMessage = messages[messages.length - 1];

  return {
    summary: {
      id: chatId,
      tab,
      topics,
      title,
      preview: lastMessage ? lastMessage.content : "",
      updatedAtIso: lastMessage ? lastMessage.createdAtIso : now.toISOString(),
      messageCount: messages.length,
      unreadCount: index < 2 ? 2 - index : 0,
      status: index === 0 ? "active" : "completed",
    },
    messages,
  };
}

function buildFixtures(now: Date): Record<TABS, ConversationFixture[]> {
  return {
    [TABS.DASHBOARD]: TOPICS_BY_TAB[TABS.DASHBOARD].map((title, index) => {
      const primary = CHAT_TOPICS[index % CHAT_TOPICS.length] ?? "Support";
      const secondary = CHAT_TOPICS[(index + 1) % CHAT_TOPICS.length] ?? "Support";
      const topics: ChatTopic[] = index % 2 === 0 ? [primary, secondary] : [primary];
      return buildConversation(TABS.DASHBOARD, index, topics, title, now);
    }),
    [TABS.AGENTS]: TOPICS_BY_TAB[TABS.AGENTS].map((title, index) =>
      buildConversation(TABS.AGENTS, index, [TOPIC_BY_TAB[TABS.AGENTS]], title, now),
    ),
    [TABS.COSTS]: TOPICS_BY_TAB[TABS.COSTS].map((title, index) =>
      buildConversation(TABS.COSTS, index, [TOPIC_BY_TAB[TABS.COSTS]], title, now),
    ),
    [TABS.GOVERNANCE]: TOPICS_BY_TAB[TABS.GOVERNANCE].map((title, index) =>
      buildConversation(TABS.GOVERNANCE, index, [TOPIC_BY_TAB[TABS.GOVERNANCE]], title, now),
    ),
    [TABS.SETTINGS]: TOPICS_BY_TAB[TABS.SETTINGS].map((title, index) =>
      buildConversation(TABS.SETTINGS, index, [TOPIC_BY_TAB[TABS.SETTINGS]], title, now),
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

  async getChatHistory(request: GetChatHistoryRequest): Promise<GetChatHistoryResponse> {
    await this.simulateLatency();

    const fixturesSource = request.scope === "all"
      ? this.getAllFixtures()
      : this.fixturesByTab[request.tab];

    const fixtures = [...fixturesSource].sort((left, right) =>
      right.summary.updatedAtIso.localeCompare(left.summary.updatedAtIso),
    );

    const requestedLimit = request.limit;
    const appliedLimit =
      typeof requestedLimit === "number"
        ? Math.max(0, Math.floor(requestedLimit))
        : fixtures.length;

    return {
      items: fixtures.slice(0, appliedLimit).map((fixture) => ({ ...fixture.summary })),
      totalCount: fixtures.length,
    };
  }

  async getChatThread(request: GetChatThreadRequest): Promise<GetChatThreadResponse> {
    await this.simulateLatency();

    const conversation = this.getAllFixtures().find((fixture) => fixture.summary.id === request.chatId);

    if (!conversation) {
      throw new Error(`Chat \"${request.chatId}\" was not found in ${request.tab}.`);
    }

    return {
      chat: { ...conversation.summary },
      messages: conversation.messages.map((message) => ({ ...message })),
    };
  }

  async createChat(request: CreateChatRequest): Promise<CreateChatResponse> {
    await this.simulateLatency();

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
    const conversation = this.getAllFixtures().find(
      (f) => f.summary.id === request.chatId,
    );
    if (conversation) {
      conversation.messages.push(userMessage, assistantMessage);
      conversation.summary.messageCount += 2;
      conversation.summary.updatedAtIso = assistantMessage.createdAtIso;
    }

    return { userMessage, assistantMessage };
  }

  async markAsRead(request: MarkAsReadRequest): Promise<MarkAsReadResponse> {
    await this.simulateLatency();

    const conversation = this.getAllFixtures().find(
      (f) => f.summary.id === request.chatId,
    );

    if (conversation) {
      conversation.summary.unreadCount = 0;
    }

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
