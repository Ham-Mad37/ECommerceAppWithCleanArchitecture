// Matches ECommerce.Application.Common.Modles.PagedResult<T>
export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
