export interface ApiResponse<T> {
  data: T
  success: true
}
export interface ApiError {
  message: string
  code: string
  success: false
}
