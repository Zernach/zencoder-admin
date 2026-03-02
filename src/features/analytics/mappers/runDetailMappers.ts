import type { RunDetailResponse } from "../types";

export interface PromptConversationRow {
  id: string;
  order: number;
  role: string;
  contentPreview: string;
  contextBefore: number;
  inputTokens: number;
  outputTokens: number;
  messageCostUsd: number;
  cumulativeCostUsd: number;
}

export interface PromptCostRow {
  id: string;
  order: number;
  role: string;
  contextBefore: number;
  inputTokens: number;
  outputTokens: number;
  messageCostUsd: number;
  cumulativeCostUsd: number;
}

export interface PromptTrendPoint {
  order: number;
  contextTokens: number;
  cumulativeCostUsd: number;
}

export interface RunDetailPromptChainViewModel {
  conversation: PromptConversationRow[];
  costRows: PromptCostRow[];
  trend: PromptTrendPoint[];
  ballooningRatio: number;
}

function roleLabel(role: "system" | "user" | "assistant" | "tool"): string {
  return role[0]!.toUpperCase() + role.slice(1);
}

function preview(content: string, max = 120): string {
  if (content.length <= max) return content;
  return `${content.slice(0, max - 1)}...`;
}

export function mapRunDetailToPromptChainViewModel(
  detail: RunDetailResponse
): RunDetailPromptChainViewModel {
  const firstInputTokens = detail.promptChain[0]?.inputTokens ?? 1;
  const base = Math.max(1, firstInputTokens);

  const conversation = detail.promptChain.map((message) => ({
    id: message.id,
    order: message.order,
    role: roleLabel(message.role),
    contentPreview: preview(message.content),
    contextBefore: message.contextTokensBefore,
    inputTokens: message.inputTokens,
    outputTokens: message.outputTokens,
    messageCostUsd: message.totalCostUsd,
    cumulativeCostUsd: message.cumulativeCostUsd,
  }));

  const costRows = conversation.map((row) => ({
    id: row.id,
    order: row.order,
    role: row.role,
    contextBefore: row.contextBefore,
    inputTokens: row.inputTokens,
    outputTokens: row.outputTokens,
    messageCostUsd: row.messageCostUsd,
    cumulativeCostUsd: row.cumulativeCostUsd,
  }));

  const trend = detail.promptChain.map((message) => ({
    order: message.order,
    contextTokens: message.contextTokensAfter,
    cumulativeCostUsd: message.cumulativeCostUsd,
  }));

  const maxContextTokens = detail.promptChainSummary.maxContextTokens;
  const ballooningRatio = maxContextTokens / base;

  return {
    conversation,
    costRows,
    trend,
    ballooningRatio,
  };
}
