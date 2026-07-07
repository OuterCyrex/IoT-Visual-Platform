import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { PlatformUser, RoleDefinition } from '../types/platform.ts'

const authSecret = process.env.AUTH_SECRET ?? 'iot-visual-platform-dev-secret'

interface TokenPayload {
  userId: string
  username: string
  role: string
  exp: number
}

const toBase64Url = (value: string) => Buffer.from(value, 'utf8').toString('base64url')
const fromBase64Url = (value: string) => Buffer.from(value, 'base64url').toString('utf8')

export const hashPassword = (plainText: string) =>
  createHash('sha256').update(`${authSecret}:${plainText}`).digest('hex')

export const verifyPassword = (plainText: string, passwordHash: string) => {
  const expected = Buffer.from(hashPassword(plainText), 'utf8')
  const actual = Buffer.from(passwordHash, 'utf8')

  if (expected.length !== actual.length) {
    return false
  }

  return timingSafeEqual(expected, actual)
}

const signPayload = (payloadBase64: string) =>
  createHmac('sha256', authSecret).update(payloadBase64).digest('base64url')

export const issueToken = (user: PlatformUser, ttlSeconds = 8 * 60 * 60) => {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }

  const payloadBase64 = toBase64Url(JSON.stringify(payload))
  const signature = signPayload(payloadBase64)
  return `${payloadBase64}.${signature}`
}

export const verifyToken = (token: string): TokenPayload | null => {
  const [payloadBase64, signature] = token.split('.')
  if (!payloadBase64 || !signature) {
    return null
  }

  const expected = Buffer.from(signPayload(payloadBase64), 'utf8')
  const actual = Buffer.from(signature, 'utf8')
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null
  }

  const payload = JSON.parse(fromBase64Url(payloadBase64)) as TokenPayload
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}

export const roleHasPermission = (role: RoleDefinition | undefined, permission: string) => {
  if (!role) {
    return false
  }
  return role.permissions.includes(permission)
}
