export interface ApiResponse<T> {
  data: T
  success: true
}

export interface ApiError {
  message: string
  code: string
  success: false
}

export interface LoginResponse {
  accessToken: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
}

export interface CurrentUserAddress {
  address: string
  streetNumber: string
  state: string
  city: string
}

export interface CurrentUserResponse {
  sub: string
  name: string
  lastName: string
  email: string
  avatar: string | null
  phone: string
  birthday: string | null
  nationalId: string | null
  taxId: string | null
  address: CurrentUserAddress | null
}
