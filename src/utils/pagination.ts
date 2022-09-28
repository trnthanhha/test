export class PaginationResult<T> {
  data: T[];
  meta: {
    total_records?: number;
    total_page?: number;
    page_size?: number;
  };
}
