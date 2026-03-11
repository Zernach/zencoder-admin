# Admin API Contracts v1

This document is the backend handoff source for endpoint shape and conventions.

## Scope
- Version: `v1`
- Base path: `/v1`
- Auth: Bearer token (`Authorization: Bearer <token>`)
- Tenant scope: every endpoint is org-scoped via `/orgs/{orgId}`
- Source of truth metadata: `src/features/analytics/contracts/endpoints.ts` and `src/features/chat/contracts/endpoints.ts`
- Machine-readable artifact: `openapi/admin-api-v1.json` (generated)

## Shared Conventions
- Timestamps: ISO-8601 UTC strings (field suffix `Iso`)
- Rates: ratio in `0..1` unless explicitly documented otherwise
- Currency fields: USD (field suffix `Usd`)
- Durations: milliseconds (field suffix `Ms`)
- IDs: opaque strings

## Error Contract
All non-2xx responses return:

```ts
interface ApiError {
  status: number;
  code: string;
  message: string;
  requestId?: string;
  details?: Array<{ field: string; code: string; message: string }>;
  retryable?: boolean;
}
```

Common status/code usage:
- `400 VALIDATION_FAILED`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `409 CONFLICT`
- `500 INTERNAL_ERROR`

## Pagination
Cursor-based contracts are available via shared primitives:

```ts
interface CursorPageRequest { cursor?: string; limit?: number }
interface CursorPageResponse<T> { items: T[]; totalCount: number; nextCursor?: string }
```

Current usage:
- Chat history uses cursor pagination directly.
- Search suggestions expose `cursor` + `limit` with `nextCursor` in response.

## WebSocket Streams (Not in OpenAPI)
- Live assistants stream uses websocket transport, not REST.
- Channel: `analytics.liveAgentSessions`
- Message type: `snapshot`
- Payload type: `LiveAgentSessionsResponse`
- Connection contract: `connectLiveAgentSessionsSocket(filters: AnalyticsFilters): LiveAgentSessionsSocket`

## Analytics Endpoints
| OperationId | Method | Path | Request Type | Response Type |
|---|---|---|---|---|
| analytics.getOverview | GET | `/v1/orgs/{orgId}/analytics/overview` | `AnalyticsFilters` | `OverviewResponse` |
| analytics.getUsage | GET | `/v1/orgs/{orgId}/analytics/usage` | `AnalyticsFilters` | `UsageResponse` |
| analytics.getOutcomes | GET | `/v1/orgs/{orgId}/analytics/outcomes` | `AnalyticsFilters` | `OutcomesResponse` |
| analytics.getCost | GET | `/v1/orgs/{orgId}/analytics/cost` | `AnalyticsFilters` | `CostResponse` |
| analytics.getReliability | GET | `/v1/orgs/{orgId}/analytics/reliability` | `AnalyticsFilters` | `ReliabilityResponse` |
| analytics.getGovernance | GET | `/v1/orgs/{orgId}/analytics/governance` | `AnalyticsFilters` | `GovernanceResponse` |
| analytics.getAgentsHub | GET | `/v1/orgs/{orgId}/analytics/agents-hub` | `AnalyticsFilters` | `AgentsHubResponse` |
| analytics.getSearchSuggestions | GET | `/v1/orgs/{orgId}/search/suggestions` | `SearchSuggestionsRequest` | `SearchSuggestionsResponse` |
| analytics.getAgentDetail | GET | `/v1/orgs/{orgId}/agents/{agentId}` | `GetAgentDetailRequest` | `AgentDetailResponse` |
| analytics.getProjectDetail | GET | `/v1/orgs/{orgId}/projects/{projectId}` | `GetProjectDetailRequest` | `ProjectDetailResponse` |
| analytics.getTeamDetail | GET | `/v1/orgs/{orgId}/teams/{teamId}` | `GetTeamDetailRequest` | `TeamDetailResponse` |
| analytics.getHumanDetail | GET | `/v1/orgs/{orgId}/humans/{humanId}` | `GetHumanDetailRequest` | `HumanDetailResponse` |
| analytics.getRunDetail | GET | `/v1/orgs/{orgId}/runs/{runId}` | `GetRunDetailRequest` | `RunDetailResponse` |
| analytics.getRuleDetail | GET | `/v1/orgs/{orgId}/governance/rules/{ruleId}` | `GetRuleDetailRequest` | `RuleDetailResponse` |
| analytics.updateRule | PATCH | `/v1/orgs/{orgId}/governance/rules/{ruleId}` | `UpdateRuleRequest` | `UpdateRuleResponse` |
| analytics.createComplianceRule | POST | `/v1/orgs/{orgId}/governance/rules` | `CreateComplianceRuleRequest` | `CreateComplianceRuleResponse` |
| analytics.createSeat | POST | `/v1/orgs/{orgId}/seats` | `CreateSeatRequest` | `CreateSeatResponse` |
| analytics.createProject | POST | `/v1/orgs/{orgId}/projects` | `CreateProjectRequest` | `CreateProjectResponse` |
| analytics.createTeam | POST | `/v1/orgs/{orgId}/teams` | `CreateTeamRequest` | `CreateTeamResponse` |
| analytics.createAgent | POST | `/v1/orgs/{orgId}/agents` | `CreateAgentRequest` | `CreateAgentResponse` |
| analytics.updateAgentDescription | PATCH | `/v1/orgs/{orgId}/agents/{agentId}/description` | `UpdateAgentDescriptionRequest` | `UpdateAgentDescriptionResponse` |

## Chat Endpoints
| OperationId | Method | Path | Request Type | Response Type |
|---|---|---|---|---|
| chat.getChatHistory | GET | `/v1/orgs/{orgId}/chat/conversations` | `GetChatHistoryRequest` | `GetChatHistoryResponse` |
| chat.getChatThread | GET | `/v1/orgs/{orgId}/chat/conversations/{chatId}` | `GetChatThreadRequest` | `GetChatThreadResponse` |
| chat.createChat | POST | `/v1/orgs/{orgId}/chat/conversations` | `CreateChatRequest` | `CreateChatResponse` |
| chat.sendMessage | POST | `/v1/orgs/{orgId}/chat/conversations/{chatId}/messages` | `SendMessageRequest` | `SendMessageResponse` |
| chat.markAsRead | POST | `/v1/orgs/{orgId}/chat/conversations/{chatId}/read` | `MarkAsReadRequest` | `MarkAsReadResponse` |

## Generation
Regenerate the OpenAPI artifact after endpoint metadata updates:

```bash
npm run contracts:openapi
```
