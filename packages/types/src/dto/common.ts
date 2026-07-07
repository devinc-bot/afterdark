export interface ApiResponse<T> {
  data: T
  success: true
}

export interface ApiError {
  message: string
  code: string
  success: false
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
