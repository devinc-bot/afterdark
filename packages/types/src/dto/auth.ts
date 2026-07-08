export interface LoginResponse {
  accessToken: string
}

export interface RegisterResponse {
  message: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: string
}
