import { compare, hash } from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashValue(value: string, saltRounds = SALT_ROUNDS): Promise<string> {
  return hash(value, saltRounds)
}

export async function verifyValue(plain: string, hashed: string): Promise<boolean> {
  return compare(plain, hashed)
}
