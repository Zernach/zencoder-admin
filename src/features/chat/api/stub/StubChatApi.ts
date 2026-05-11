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
      title: "Q1 supply-chain snapshot before board readout",
      topics: ["Support", "Costs"],
      status: "active",
      unreadCount: 2,
      startedMinutesAgo: 88,
      gapMinutes: 10,
      messages: [
        {
          role: "user",
          content:
            "I need a one-page snapshot: OTIF, disruption alerts handled, and top 3 at-risk service lines for the last 7 days.",
        },
        {
          role: "assistant",
          content:
            "Drafted. Network OTIF is 94.2%, 312 disruption alerts auto-resolved, and the highest-risk service lines are Cardiac Cath Lab, Orthopedic OR, and ICU Pharmacy.",
        },
        {
          role: "user",
          content:
            "Add a callout for why Cardiac Cath Lab risk went up this week.",
        },
        {
          role: "assistant",
          content:
            "Added: lead time for drug-eluting stents extended 6 days after the Boston Scientific distribution-center event, and two backup vendors are at PAR.",
        },
      ],
    },
    {
      title: "Anomaly triage for OR stockout near-misses",
      topics: ["Agents", "Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 305,
      gapMinutes: 12,
      messages: [
        {
          role: "user",
          content:
            "OR stockout near-misses jumped this morning. Was this a forecast miss or an upstream supplier issue?",
        },
        {
          role: "assistant",
          content:
            "Mostly upstream: 68% of near-misses traced to a Cardinal Health distribution delay on three high-volume SKUs. Forecasts were within tolerance.",
        },
        {
          role: "user",
          content:
            "Which service line was most affected?",
        },
        {
          role: "assistant",
          content:
            "Orthopedic OR contributed 42% of impacted cases. Suggest activating qualified backup supplier for the next 72 hours.",
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
            "Rewrite the weekly update to be less technical for the CFO. Keep three bullets and one action item.",
        },
        {
          role: "assistant",
          content:
            "Shared a plain-language version focused on resiliency, clinical impact avoided, and contract spend trend. Action item: expand backup-vendor qualification for implants.",
        },
      ],
    },
    {
      title: "Follow-up after critical implant backorder incident",
      topics: ["Agents", "Support"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 3240,
      gapMinutes: 22,
      messages: [
        {
          role: "user",
          content:
            "Capture what we learned from yesterday's pacemaker backorder incident and what we changed.",
        },
        {
          role: "assistant",
          content:
            "Summary prepared: root cause was single-source dependency at Medtronic, mitigation was activating Abbott as qualified backup, and we added a 7-day lead-time saturation alert for Class III implants.",
        },
      ],
    },
  ],
  [TABS.AGENTS]: [
    {
      title: "Threshold tuning for Disruption Monitor false positives",
      topics: ["Agents"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 55,
      gapMinutes: 9,
      messages: [
        {
          role: "user",
          content:
            "Should we tighten the Disruption Monitor sensitivity? Materials managers are noting too many low-impact alerts.",
        },
        {
          role: "assistant",
          content:
            "Recommend keeping HIGH severity threshold at 0.85 and raising MEDIUM to 0.65. That cuts noise 38% while preserving 99% of clinically critical detections.",
        },
        {
          role: "user",
          content:
            "What if we scope tighter thresholds only to non-critical SKUs?",
        },
        {
          role: "assistant",
          content:
            "Safer. Non-critical SKU scoping adds only 1.8% missed-detection risk and avoids alert fatigue in the OR materials team.",
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
            "EHR connector timeouts are up 14% on Substitute Recommender, and contract-pricing lookup errors are up 9% on Procedure Card Optimizer. Other categories are flat.",
        },
      ],
    },
    {
      title: "EHR connector queue optimization for Mercy network",
      topics: ["Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 1460,
      gapMinutes: 15,
      messages: [
        {
          role: "user",
          content:
            "Mercy Health Epic connector latency crossed 2s again. Give me a concrete mitigation sequence.",
        },
        {
          role: "assistant",
          content:
            "Plan: reserve 15% burst capacity for Mercy region, rebalance stale supplier polls every 30s, then run a two-hour canary before full rollout.",
        },
      ],
    },
    {
      title: "EHR fallback thresholds and guardrails",
      topics: ["Agents"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 3780,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "Document fallback triggers between primary EHR (Epic) and secondary feed (HL7 mirror) with rollback criteria.",
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
      title: "Root cause analysis for today's supply spend spike",
      topics: ["Costs"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 64,
      gapMinutes: 8,
      messages: [
        {
          role: "user",
          content:
            "OR supply spend jumped 19% since Monday. What changed by service line and contract tier?",
        },
        {
          role: "assistant",
          content:
            "Primary driver is the Cardiac Cath Lab, up $61k due to off-contract drug-eluting stent orders after Boston Scientific lead-time extended. Tier mix mostly constant.",
        },
        {
          role: "user",
          content:
            "Can we contain this this week without delaying scheduled cases?",
        },
        {
          role: "assistant",
          content:
            "Yes. Activate the qualified Abbott alternative on contract for 7 days and route urgent cases to it. Estimated week-over-week savings: $23k with no case delay.",
        },
      ],
    },
    {
      title: "Forecast confidence for end-of-month supply budget",
      topics: ["Costs", "Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 610,
      gapMinutes: 13,
      messages: [
        {
          role: "user",
          content:
            "Given current trend, are we likely to exceed this month's supply budget?",
        },
        {
          role: "assistant",
          content:
            "Projection lands at 94% of budget with medium confidence. Biggest risk is unplanned orthopedic implant volume in week 4.",
        },
      ],
    },
    {
      title: "Procedure card waste reduction opportunities",
      topics: ["Costs", "Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 1710,
      gapMinutes: 17,
      messages: [
        {
          role: "user",
          content:
            "Find low-risk opportunities to reduce per-case supply cost in general surgery procedure cards.",
        },
        {
          role: "assistant",
          content:
            "Three opportunities identified: pack right-sizing for 14 cards, single-use-to-reusable swap on retractors, and removal of items opened-not-used >40% of cases. Combined savings ~7.4% per case.",
        },
      ],
    },
    {
      title: "Vendor spend split for GPO contract review",
      topics: ["Costs"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 4320,
      gapMinutes: 24,
      messages: [
        {
          role: "user",
          content:
            "I need a vendor split summary for the GPO review: spend, OTIF, and single-source risk.",
        },
        {
          role: "assistant",
          content:
            "Prepared with recommendation to keep dual-source strategy on Class III implants. Vizient handles 71% spend with best OTIF, Premier maintains failover resilience.",
        },
      ],
    },
  ],
  [TABS.GOVERNANCE]: [
    {
      title: "Substitution exception request for clinical trial site",
      topics: ["Governance", "Support"],
      status: "active",
      unreadCount: 0,
      startedMinutesAgo: 140,
      gapMinutes: 9,
      messages: [
        {
          role: "user",
          content:
            "Can we approve a temporary substitution exception for the cardiology trial while we tune the equivalence rules?",
        },
        {
          role: "assistant",
          content:
            "Possible with guardrails. Limit to enrolled-patient SKUs, require pharmacy + PI sign-off per case, and auto-expire in 14 days.",
        },
        {
          role: "user",
          content:
            "Add approval language for IRB and clinical leadership sign-off.",
        },
        {
          role: "assistant",
          content:
            "Added wording plus rollback trigger: revoke immediately if any substitution flags a clinical-equivalence variance >0.5% over 24 hours.",
        },
      ],
    },
    {
      title: "Violation trend analysis by compliance class",
      topics: ["Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 730,
      gapMinutes: 14,
      messages: [
        {
          role: "user",
          content:
            "Break down violations by compliance class and flag anything accelerating.",
        },
        {
          role: "assistant",
          content:
            "Missing UDI capture and non-equivalent substitution classes are rising fastest, up 18% and 11% week over week respectively.",
        },
      ],
    },
    {
      title: "FDA recall response timeline draft",
      topics: ["Governance", "Agents"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2100,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "Draft a timeline for the Class II recall response with key checkpoints and owners across pharmacy, OR, and materials.",
        },
        {
          role: "assistant",
          content:
            "Timeline drafted with detection, lot segregation, patient notification, and FDA reporting milestones plus owner assignment for each phase.",
        },
      ],
    },
    {
      title: "Quarterly Joint Commission audit prep",
      topics: ["Governance"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5100,
      gapMinutes: 28,
      messages: [
        {
          role: "user",
          content:
            "Assemble a concise Joint Commission audit summary with policy coverage and exception counts.",
        },
        {
          role: "assistant",
          content:
            "Prepared and organized by control family (DSCSA, USP <797>, controlled substances), with exception aging and closure-rate trend included for audit committee review.",
        },
      ],
    },
  ],
  [TABS.CHAT]: [
    {
      title: "Cross-facility rollout for new substitution policy",
      topics: ["Support", "Governance"],
      status: "active",
      unreadCount: 1,
      startedMinutesAgo: 140,
      gapMinutes: 12,
      messages: [
        {
          role: "user",
          content:
            "Draft a rollout plan for the new clinically equivalent substitution policy across all 14 facilities.",
        },
        {
          role: "assistant",
          content:
            "Drafted with a staged rollout by service line, pharmacy/clinical sign-off checkpoints, and weekly adoption review milestones.",
        },
      ],
    },
    {
      title: "Unified supply-chain status update for COO",
      topics: ["Agents", "Costs", "Governance"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 780,
      gapMinutes: 16,
      messages: [
        {
          role: "user",
          content:
            "Create a concise update for the COO covering resiliency, supply spend, and compliance risk trends.",
        },
        {
          role: "assistant",
          content:
            "Prepared a three-part update summarizing resiliency drift, spend deltas vs. budget, and unresolved compliance violations with owners.",
        },
      ],
    },
    {
      title: "Onboarding checklist for new materials manager",
      topics: ["Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2310,
      gapMinutes: 20,
      messages: [
        {
          role: "user",
          content:
            "I need a practical onboarding checklist for newly added materials managers.",
        },
        {
          role: "assistant",
          content:
            "Checklist created with EHR + ERP access setup, alert preferences, formulary review, and procedure-card ownership handoff.",
        },
      ],
    },
    {
      title: "Change communication for Epic connector update",
      topics: ["Support"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5520,
      gapMinutes: 24,
      messages: [
        {
          role: "user",
          content:
            "Write a clinician-facing note about the upcoming Epic connector update and expected impact on supply requests.",
        },
        {
          role: "assistant",
          content:
            "Drafted communication with timeline, potential interruptions to PAR-level data, and support contacts for clinical staff during migration.",
        },
      ],
    },
  ],
  [TABS.SETTINGS]: [
    {
      title: "Notification defaults cleanup for new facilities",
      topics: ["Support"],
      status: "active",
      unreadCount: 0,
      startedMinutesAgo: 210,
      gapMinutes: 10,
      messages: [
        {
          role: "user",
          content:
            "Our new facilities inherit noisy alert defaults. Suggest a cleaner baseline for materials managers.",
        },
        {
          role: "assistant",
          content:
            "Recommended baseline: HIGH-severity disruption alerts only, daily resiliency digest at 07:00 local, and weekly contract spend summary enabled.",
        },
      ],
    },
    {
      title: "Language rollout checklist for clinical staff",
      topics: ["Support"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 860,
      gapMinutes: 16,
      messages: [
        {
          role: "user",
          content:
            "Create a rollout checklist for enabling Spanish, French, and Tagalog across clinical-facing screens.",
        },
        {
          role: "assistant",
          content:
            "Checklist prepared with translation QA on clinical terms, fallback locale behavior, and phased enablement by facility.",
        },
      ],
    },
    {
      title: "Currency migration readiness for Canadian sites",
      topics: ["Support", "Costs"],
      status: "completed",
      unreadCount: 0,
      startedMinutesAgo: 2490,
      gapMinutes: 22,
      messages: [
        {
          role: "user",
          content:
            "Are we ready to switch default reporting currency to CAD for the Toronto facility?",
        },
        {
          role: "assistant",
          content:
            "Almost. Conversion settings are in place, but two downstream GPO exports still assume USD labels.",
        },
      ],
    },
    {
      title: "Access control policy update for Astra Assistant",
      topics: ["Support", "Governance"],
      status: "archived",
      unreadCount: 0,
      startedMinutesAgo: 5760,
      gapMinutes: 30,
      messages: [
        {
          role: "user",
          content:
            "Draft clinician-facing comms for upcoming Astra Assistant access changes and impact on existing super-users.",
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
    content: `Astra OS context loaded for ${tab} with facility, service-line, and time-range filters.`,
    createdAtIso: startedAt.toISOString(),
  };
  const conversationMessages = template.messages.map((message, messageIndex) => {
    const createdAt = addMinutes(startedAt, (messageIndex + 1) * template.gapMinutes);
    return {
      id: `${chatId}-m${messageIndex + 2}`,
      chatId,
      role: message.role,
      authorName: message.role === "assistant" ? "Astra Assistant" : "Admin",
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
      content: `Astra OS initialized for ${request.tab} supply-chain workflows.`,
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
      authorName: "Astra Assistant",
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
      authorName: "Astra Assistant",
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
      "Great topic! This is a demo environment though, so the AI chat is stubbed out. In production, Astra would pull live data from your hospital ERP, EHR, and supplier feeds to give you a real answer.",
      "Interesting question! Since this is a demo, I can't fetch real supply-chain data right now. In the full version, I'd analyze your OTIF, disruption signals, and contract spend to provide actionable insights.",
      "Good discussion point! The chat feature is running in demo mode, so my responses are pre-written. The production version connects to your live Clarium Astra OS workspace.",
      "I appreciate the question! This is a stubbed demo, but in a real deployment I'd have full access to your dashboards, workflow apps, and contract spend data to help you out.",
    ];
    const response = responses[this.stubResponseIndex % responses.length]!;
    this.stubResponseIndex += 1;
    return response;
  }
}
