import { clientEnv } from '../config/env.ts'
export const API_PREFIX = 'api'

export const API_URL = `${clientEnv.VITE_API_URL}/${API_PREFIX}`
