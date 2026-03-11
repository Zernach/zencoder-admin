# API Contract Audit (Backend Handoff Readiness)

Last updated: 2026-03-11

## 1) Current State

### Contract surfaces
- Analytics API interface: `src/features/analytics/api/IAnalyticsApi.ts`
- Analytics service interface: `src/features/analytics/services/IAnalyticsService.ts`
- Chat API interface: `src/features/chat/api/IChatApi.ts`
- Chat service interface: `src/features/chat/services/IChatService.ts`
- Shared analytics contracts: `src/features/analytics/types/contracts.ts`
- Shared chat contracts: `src/features/chat/types/contracts.ts`
- HTTP metadata + errors/pagination/versioning primitives: `src/contracts/http/*`
- Endpoint registry (method/path/type mapping):
  - `src/features/analytics/contracts/endpoints.ts`
  - `src/features/chat/contracts/endpoints.ts`
  - `src/contracts/http/endpointRegistry.ts`
- Machine-readable output:
  - `openapi/admin-api-v1.json`
  - `docs/openapi/admin-api-v1.json`

### API ↔ service mapping
- `IAnalyticsService` now extends `IAnalyticsApi` directly.
- `IChatService` now extends `IChatApi` directly.
- Result: no contract duplication between API and service interfaces.

### Method-to-contract mapping
Full operation map (including HTTP method/path) is in `docs/openapi/api-contracts.md`.

Analytics operations (`IAnalyticsApi`):
- `getOverview(AnalyticsFilters): Promise<OverviewResponse>`
- `getUsage(AnalyticsFilters): Promise<UsageResponse>`
- `getOutcomes(AnalyticsFilters): Promise<OutcomesResponse>`
- `getCost(AnalyticsFilters): Promise<CostResponse>`
- `getReliability(AnalyticsFilters): Promise<ReliabilityResponse>`
- `getGovernance(AnalyticsFilters): Promise<GovernanceResponse>`
- `getAgentsHub(AnalyticsFilters): Promise<AgentsHubResponse>`
- `connectLiveAgentSessionsSocket(AnalyticsFilters): LiveAgentSessionsSocket` (websocket stream, excluded from OpenAPI endpoint table)
- `getSearchSuggestions(SearchSuggestionsRequest): Promise<SearchSuggestionsResponse>`
- `getAgentDetail(GetAgentDetailRequest): Promise<AgentDetailResponse>`
- `getProjectDetail(GetProjectDetailRequest): Promise<ProjectDetailResponse>`
- `getTeamDetail(GetTeamDetailRequest): Promise<TeamDetailResponse>`
- `getHumanDetail(GetHumanDetailRequest): Promise<HumanDetailResponse>`
- `getRunDetail(GetRunDetailRequest): Promise<RunDetailResponse>`
- `getRuleDetail(GetRuleDetailRequest): Promise<RuleDetailResponse>`
- `updateRule(UpdateRuleRequest): Promise<UpdateRuleResponse>`
- `createComplianceRule(CreateComplianceRuleRequest): Promise<CreateComplianceRuleResponse>`
- `createSeat(CreateSeatRequest): Promise<CreateSeatResponse>`
- `createProject(CreateProjectRequest): Promise<CreateProjectResponse>`
- `createTeam(CreateTeamRequest): Promise<CreateTeamResponse>`
- `createAgent(CreateAgentRequest): Promise<CreateAgentResponse>`
- `updateAgentDescription(UpdateAgentDescriptionRequest): Promise<UpdateAgentDescriptionResponse>`

Chat operations (`IChatApi`):
- `getChatHistory(GetChatHistoryRequest): Promise<GetChatHistoryResponse>`
- `getChatThread(GetChatThreadRequest): Promise<GetChatThreadResponse>`
- `createChat(CreateChatRequest): Promise<CreateChatResponse>`
- `sendMessage(SendMessageRequest): Promise<SendMessageResponse>`
- `markAsRead(MarkAsReadRequest): Promise<MarkAsReadResponse>`

### Shared vs duplicated types
- Shared (single source of truth): request/response/domain contracts in feature contract files above.
- Removed duplication:
  - service contracts now inherit API contracts (`extends`), instead of independently repeating method signatures.

### Org/tenant context
- Standardized to org-scoped contracts.
- Detail endpoints now use request objects with `orgId` + entity id (instead of positional params).
- Chat contracts now require `orgId` on all methods.
- Create/update requests include `orgId` consistently.

### Error contract
- Shared error type introduced in `src/contracts/http/errors.ts`:
  - `ApiError`
  - `ApiContractError`
  - helpers (`validationError`, `notFoundError`, `conflictError`, `internalError`, `toApiError`)
- RTK Query analytics base query now uses `fakeBaseQuery<ApiError>()` and maps exceptions through `toApiError`.
- Hooks use `getApiErrorMessage(...)` instead of unsafe string casts.

### Pagination
- Shared primitives added in `src/contracts/http/pagination.ts`.
- Cursor pagination now used by:
  - `GetChatHistoryRequest` / `GetChatHistoryResponse`
  - `SearchSuggestionsRequest` / `SearchSuggestionsResponse`

### Versioning
- Central API version constant:
  - `API_VERSION = "v1"`
  - `API_BASE_PATH = "/v1"`
- Endpoint metadata paths all rooted under `/v1`.

## 2) Handoff Blockers: Status

### Blockers resolved
- HTTP method/path/operation mapping now explicit per endpoint.
- Tenant scoping (`orgId`) is consistent across analytics and chat contracts.
- Shared error shape is defined and used in stubs + RTK Query.
- Pagination contract primitives are standardized.
- OpenAPI artifact generation is available and scriptable.

### Remaining gaps (for full codegen-grade contracts)
- Generated OpenAPI schemas are placeholders (`type: object`) for request/response models; they are not yet full field-level JSON schemas.
- Query serialization conventions for arrays (`teamIds`, `providers`, etc.) are not explicitly documented as `form`/`explode` or CSV.
- Auth is modeled as Bearer, but endpoint-level authorization scopes/roles are not yet documented.
- No formal deprecation policy yet beyond version constant.

## 3) Prioritized Next Steps

### P0 (backend can start now)
1. Implement endpoints from `docs/openapi/api-contracts.md` and `openapi/admin-api-v1.json`.
2. Use shared error codes/statuses from `src/contracts/http/errors.ts`.
3. Treat all endpoints as org-scoped (`/v1/orgs/{orgId}/...`).

### P1 (high value, near-term)
1. Replace placeholder OpenAPI schemas with generated JSON Schema from TypeScript contracts.
2. Add explicit query parameter serialization rules in endpoint metadata and handoff docs.
3. Add per-endpoint authz scope notes (forbidden vs unauthorized expectations).

### P2 (nice-to-have)
1. Add endpoint deprecation policy section to handoff docs.
2. Add idempotency guidance for write endpoints (`POST`/`PATCH`).

## 4) Recommended Handoff Template

Use this per endpoint in backend planning docs:

```md
### <operationId>
- Method: <GET|POST|PATCH|...>
- Path: </v1/orgs/{orgId}/...>
- Auth: Bearer JWT
- Tenant: org-scoped (`orgId` in path)
- Request contract: <TypeName>
- Response contract: <TypeName>
- Success status: <200|201>
- Error responses:
  - 400 VALIDATION_FAILED
  - 401 UNAUTHORIZED
  - 403 FORBIDDEN
  - 404 NOT_FOUND (if applicable)
  - 409 CONFLICT (if applicable)
  - 500 INTERNAL_ERROR
- Notes:
  - Query serialization: <form/explode or CSV>
  - Idempotency behavior: <if write endpoint>
```

## 5) File-Level Integration Points

Where to add/update endpoint metadata without touching UI/service abstractions:
- Add/edit endpoint definitions in:
  - `src/features/analytics/contracts/endpoints.ts`
  - `src/features/chat/contracts/endpoints.ts`
- Shared aggregation point:
  - `src/contracts/http/endpointRegistry.ts`
- Shared HTTP primitives:
  - `src/contracts/http/errors.ts`
  - `src/contracts/http/pagination.ts`
  - `src/contracts/http/versioning.ts`
- OpenAPI generation:
  - `scripts/contracts/generate-openapi.ts`
  - `npm run contracts:openapi`
