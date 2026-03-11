# 0082 — API Contract Architecture Audit & Backend Handoff Readiness

> Harden API contracts and documentation so backend engineers can implement real endpoints with minimal ambiguity while preserving stubbed frontend architecture.

---

## User Stories

1. As a backend engineer, I want each frontend API operation mapped to an explicit HTTP contract so I can implement endpoints quickly.
2. As a frontend engineer, I want shared request/response/error types and org scoping to be consistent across analytics and chat.
3. As a maintainer, I want machine-readable endpoint metadata and generated OpenAPI artifacts so contracts stay synchronized.

## Prior State

- API interfaces existed, but HTTP method/path semantics were implied rather than centralized.
- Org scoping and request shape conventions were inconsistent (mixed positional params and request objects).
- Error handling used ad hoc shapes in some paths.
- Pagination conventions were not standardized across feature contracts.
- Backend handoff docs were incomplete for endpoint-by-endpoint implementation.

## Target State

1. Contract metadata and registry:
- Add endpoint metadata primitives and a centralized registry for analytics + chat.
- Define operation id, method, path, request type, response type, success status, and error responses per operation.

2. Shared HTTP contract primitives:
- Introduce shared `ApiError` and validation issue contracts.
- Add standardized cursor/offset pagination primitives.
- Add API version/base path constants.

3. Request/response contract consistency:
- Normalize analytics detail methods to request objects (`{ orgId, <entityId> }`).
- Add `orgId` to relevant create/update/search/chat requests.
- Align chat history/search on cursor pagination shapes.

4. Runtime wiring updates:
- Use typed `ApiError` in RTK Query base query and error conversion helpers.
- Update hooks/screens/stub APIs to pass and validate `orgId` consistently.

5. Backend handoff outputs:
- Add backend handoff docs with endpoint matrix and shared conventions.
- Generate OpenAPI artifact from endpoint registries.
- Add readiness audit doc with gaps/priorities.

## Files Created / Updated

### Contracts and metadata
- `src/contracts/http/errors.ts` (new)
- `src/contracts/http/pagination.ts` (new)
- `src/contracts/http/versioning.ts` (new)
- `src/contracts/http/endpointTypes.ts` (new)
- `src/contracts/http/endpointRegistry.ts` (new)
- `src/contracts/http/index.ts` (new)
- `src/features/analytics/contracts/endpoints.ts` (new)
- `src/features/analytics/contracts/index.ts` (new)
- `src/features/chat/contracts/endpoints.ts` (new)
- `src/features/chat/contracts/index.ts` (new)

### Feature API contracts/interfaces/services
- `src/features/analytics/types/contracts.ts`
- `src/features/chat/types/contracts.ts`
- `src/features/analytics/api/IAnalyticsApi.ts`
- `src/features/chat/api/IChatApi.ts`
- `src/features/analytics/services/IAnalyticsService.ts`
- `src/features/chat/services/IChatService.ts`
- `src/features/analytics/services/AnalyticsService.ts`

### Stubs, hooks, store integration
- `src/features/analytics/api/stub/StubAnalyticsApi.ts`
- `src/features/chat/api/stub/StubChatApi.ts`
- `src/store/api/analyticsApi.ts`
- `src/features/analytics/hooks/*` (error + org scoped request updates)
- `src/features/chat/hooks/*` (org-scoped request updates)
- `src/features/search/hooks/useEntityDetail.ts`
- `src/features/search/screens/AgentDetailScreen.tsx`
- `src/features/search/screens/RuleDetailScreen.tsx`
- `src/components/shell/MiniChatModal.tsx`
- `src/store/slices/filtersSlice.ts`
- `src/store/slices/index.ts`
- `src/store/index.ts`

### Docs and generation
- `scripts/contracts/generate-openapi.ts` (new)
- `package.json` (`contracts:openapi` script)
- `openapi/admin-api-v1.json` (generated)
- `docs/openapi/admin-api-v1.json`
- `docs/openapi/api-contracts.md` (new)
- `docs/openapi/api-contract-audit.md` (new)
- `docs/technical.md`

## Acceptance Criteria

- Every `IAnalyticsApi` and `IChatApi` method has endpoint metadata with method/path/request/response mapping.
- Service interfaces no longer duplicate API contract signatures.
- Error responses use shared `ApiError` shape across RTK Query and stubs.
- Org scoping is explicit and consistent in analytics + chat request contracts.
- Cursor pagination contracts are standardized and used where applicable.
- OpenAPI artifact is generated from registry metadata.
- Backend handoff docs include endpoint matrix, error model, pagination conventions, and implementation priorities.

## Test Plan (Run)

1. Type safety:
- `npx tsc --noEmit`

2. Contract/OpenAPI generation:
- `npm run contracts:openapi`

3. Targeted suites for affected surfaces:
- `npx jest src/features/analytics/api/stub/__tests__/StubAnalyticsApi.test.ts`
- `npx jest src/features/analytics/api/stub/__tests__/StubAnalyticsApi.createEntities.test.ts`
- `npx jest src/features/analytics/services/__tests__/AnalyticsService.test.ts`
- `npx jest src/features/analytics/services/__tests__/AnalyticsService.createEntities.test.ts`
- `npx jest src/features/search/screens/__tests__/entityScreens.test.tsx`

## Notes

- OpenAPI endpoint coverage is complete, but request/response schemas are still placeholders for codegen purposes.
- A follow-up can add full TypeScript-to-JSON-Schema generation for field-level OpenAPI schemas.
