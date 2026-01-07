/**
 * Pagination result type
 */
export interface PaginatedResult<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginatedResult<unknown>['pagination'] {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Parse pagination query parameters
 */
export function parsePaginationParams(
  searchParams: Record<string, string | string[] | undefined>
): { page: number; limit: number } {
  const page = Math.max(1, parseInt((searchParams.page as string) || '1', 10) || 1)
  const limit = Math.max(
    1,
    Math.min(100, parseInt((searchParams.limit as string) || '20', 10) || 20)
  )

  return { page, limit }
}

/**
 * Apply pagination to an array
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number
): PaginatedResult<T> {
  const total = items.length
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedItems = items.slice(start, end)

  return {
    items: paginatedItems,
    pagination: calculatePagination(page, limit, total),
  }
}
