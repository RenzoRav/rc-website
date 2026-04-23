import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { createSession } from '../utils/session'

interface RateRecord {
  attempts:    number
  blockedUntil: number
  level:       number
}

const rateLimitStore = new Map<string, RateRecord>()

const BLOCK_DURATIONS = [0, 15 * 60_000, 60 * 60_000, 24 * 60 * 60_000] as const
const MAX_ATTEMPTS    = [5, 3, 2] as const

function getClientIp(event: Parameters<typeof getHeader>[0]): string {
  return (
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ??
    getHeader(event, 'x-real-ip') ??
    'unknown'
  )
}

function checkRateLimit(ip: string): void {
  const now = Date.now()
  const rec = rateLimitStore.get(ip)
  if (!rec) return

  if (rec.blockedUntil > 0 && now >= rec.blockedUntil) {
    rec.blockedUntil = 0
    rec.attempts = 0
    rateLimitStore.set(ip, rec)
    return
  }

  if (rec.blockedUntil > now) {
    throw createError({ statusCode: 429, statusMessage: 'Too Many Requests' })
  }
}

function recordFailure(ip: string): void {
  const now = Date.now()
  const rec: RateRecord = rateLimitStore.get(ip) ?? { attempts: 0, blockedUntil: 0, level: 0 }
  rec.attempts++

  const maxForLevel = MAX_ATTEMPTS[Math.min(rec.level, MAX_ATTEMPTS.length - 1)] ?? 2

  if (rec.attempts >= maxForLevel) {
    const nextLevel = Math.min(rec.level + 1, BLOCK_DURATIONS.length - 1)
    rec.blockedUntil = now + (BLOCK_DURATIONS[nextLevel] ?? 0)
    rec.level        = nextLevel
    rec.attempts     = 0
  }

  rateLimitStore.set(ip, rec)
}

function clearRateLimit(ip: string): void {
  rateLimitStore.delete(ip)
}

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event)

  checkRateLimit(ip)

  const body     = await readBody<{ password?: unknown }>(event).catch(() => ({} as { password?: unknown }))
  const password = typeof body?.password === 'string' ? body.password.slice(0, 128) : ''

  const delayMs = 600 + Math.floor(Math.random() * 601)
  await new Promise((resolve) => setTimeout(resolve, delayMs))

  const config       = useRuntimeConfig()
  const salt         = (config.salt              as string) ?? ''
  const expectedHash = (config.adminPasswordHash as string) ?? ''

  if (!expectedHash) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const data       = new TextEncoder().encode(salt + password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const inputHash  = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (inputHash !== expectedHash) {
    recordFailure(ip)
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const sessionToken = crypto.randomUUID()
  await createSession(sessionToken)

  clearRateLimit(ip)
  return { success: true, sessionToken }
})
