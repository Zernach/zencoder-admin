import type { ModelProvider } from "../types";

/**
 * Single source of truth for model providers and the models each one offers.
 *
 * Provider and model names are brand names (OpenAI, Gemini, GPT-4o, …) and are
 * intentionally NOT routed through i18n — they read identically in every
 * locale. The frontend (filters, charts) and the stubbed backend (seed data,
 * analytics aggregation) both import from this module so there is exactly one
 * definition of the provider/model universe.
 */

/** Ordered list of supported model providers. */
export const PROVIDER_VALUES: ModelProvider[] = [
  "openai",
  "anthropic",
  "gemini",
  "grok",
  "deepseek",
  "mistral",
];

/** Human-readable provider names (brand names — not localized). */
export const PROVIDER_LABELS: Record<ModelProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
  grok: "Grok",
  deepseek: "DeepSeek",
  mistral: "Mistral",
};

/** Model identifiers offered by each provider. */
export const MODELS_BY_PROVIDER: Record<ModelProvider, string[]> = {
  openai: ["gpt-4o", "gpt-4o-mini", "o3", "o4-mini"],
  anthropic: ["claude-opus-4", "claude-sonnet-4", "claude-haiku-4"],
  gemini: ["gemini-2.5-pro", "gemini-2.5-flash"],
  grok: ["grok-4", "grok-3-mini"],
  deepseek: ["deepseek-v3", "deepseek-r1"],
  mistral: ["mistral-large", "mistral-small"],
};

/** Human-readable model names keyed by model id (brand names — not localized). */
export const MODEL_LABELS: Record<string, string> = {
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o mini",
  o3: "o3",
  "o4-mini": "o4-mini",
  "claude-opus-4": "Claude Opus 4",
  "claude-sonnet-4": "Claude Sonnet 4",
  "claude-haiku-4": "Claude Haiku 4",
  "gemini-2.5-pro": "Gemini 2.5 Pro",
  "gemini-2.5-flash": "Gemini 2.5 Flash",
  "grok-4": "Grok 4",
  "grok-3-mini": "Grok 3 mini",
  "deepseek-v3": "DeepSeek-V3",
  "deepseek-r1": "DeepSeek-R1",
  "mistral-large": "Mistral Large",
  "mistral-small": "Mistral Small",
};

/** Flat list of every model id, ordered by provider. */
export const MODEL_VALUES: string[] = PROVIDER_VALUES.flatMap(
  (provider) => MODELS_BY_PROVIDER[provider],
);

/** Reverse lookup: which provider a model id belongs to. */
export const PROVIDER_OF_MODEL: Record<string, ModelProvider> = Object.fromEntries(
  PROVIDER_VALUES.flatMap((provider) =>
    MODELS_BY_PROVIDER[provider].map((modelId) => [modelId, provider] as const),
  ),
);

/** Display label for a model id, falling back to the raw id when unknown. */
export function modelLabel(modelId: string): string {
  return MODEL_LABELS[modelId] ?? modelId;
}
