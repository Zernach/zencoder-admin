import type { IAnalyticsApi } from "../api/IAnalyticsApi";

// Keep the service contract locked to the API contract surface.
export interface IAnalyticsService extends IAnalyticsApi {}
