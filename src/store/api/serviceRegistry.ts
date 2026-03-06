import type { IAnalyticsService } from "@/features/analytics/services/IAnalyticsService";

let _service: IAnalyticsService | null = null;

export function initializeService(service: IAnalyticsService): void {
  _service = service;
}

export function getService(): IAnalyticsService {
  if (!_service) {
    throw new Error(
      "Service not initialized. Call initializeService() before using RTK Query endpoints.",
    );
  }
  return _service;
}
