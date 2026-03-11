export interface CursorPageRequest {
  cursor?: string;
  limit?: number;
}

export interface CursorPageResponse<TItem> {
  items: TItem[];
  totalCount: number;
  nextCursor?: string;
}

export interface OffsetPageRequest {
  page: number;
  pageSize: number;
}

export interface OffsetPageResponse<TItem> {
  items: TItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}
