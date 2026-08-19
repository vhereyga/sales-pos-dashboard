export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function parsePaginationParams(query: { page?: string | number; limit?: string | number }): PaginationParams {
  let page = Number(query.page);
  let limit = Number(query.limit);

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  // Max limit boundary to prevent memory overhead
  if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginatedResult<T>(data: T[], total: number, params: PaginationParams): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit) || 1;
  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages
    }
  };
}
