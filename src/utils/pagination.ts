export class PaginationResult<T> {
  data: T[];
  meta: {
    total_records?: number;
    total_page?: number;
    page_size?: number;
  };

  constructor(data: T[], total: number, limit: number) {
    this.data = data;
    this.meta = {
      page_size: limit,
      total_page: Math.ceil(total / limit),
      total_records: total,
    };
  }
}
