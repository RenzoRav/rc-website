export function generateToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)

  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80

  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0'))
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10).join(''),
  ].join('-')
}

export function generateCSRFToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token)
  }

  return token
}

export function sanitizeInput(value: string): string {
  if (typeof value !== 'string') return ''

  let v = value.normalize('NFKC')
  v = v.trim()
  v = v.slice(0, 128)
  v = v.replace(/[\x00-\x1F\x7F]/g, '')
  v = v.replace(/<[^>]*>/g, '')
  v = v.replace(/javascript:/gi, '')
  v = v.replace(/data:/gi, '')
  v = v.replace(/vbscript:/gi, '')

  return v
}

export function sanitizeData(obj: unknown): unknown {
  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/') && obj.includes(';base64,')) return obj
    if (obj.startsWith('https://') && obj.length <= 2048) return obj
    return sanitizeInput(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeData)
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      const safeKey = sanitizeInput(String(key))
      result[safeKey] = sanitizeData(value)
    }
    return result
  }

  return obj
}

export function detectSuspiciousInput(value: string): boolean {
  if (typeof value !== 'string') return false

  const v = value.normalize('NFKC').toUpperCase()

  const sqlPatterns = [
    /'\s*OR\b/i,
    /'\s*AND\b/i,
    /UNION\s+SELECT/i,
    /DROP\s+TABLE/i,
    /INSERT\s+INTO/i,
    /DELETE\s+FROM/i,
    /1\s*=\s*1/,
    /1\s*=\s*0/,
    /--/,
    /\/\*/,
    /\*\//,
    /;\s*(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER)/i,
    /EXEC\s*\(/i,
    /CAST\s*\(/i,
    /CONVERT\s*\(/i,
  ]

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /onmouseover\s*=/i,
    /onfocus\s*=/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /window\.location/i,
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /<iframe/i,
    /<img[^>]+src\s*=/i,
    /&#\d+;/,
    /%3C/i,
    /%3E/i,
  ]

  const pathPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e/i,
    /%2f/i,
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
  ]

  const nullBytePattern = /\x00/

  const isTooLong = value.length > 500
  const hasRepetition = /(.)\1{20,}/.test(value)

  const allPatterns = [...sqlPatterns, ...xssPatterns, ...pathPatterns, nullBytePattern]
  const detected = allPatterns.some((pattern) => pattern.test(value)) || isTooLong || hasRepetition

  if (detected) {
    const detail = isTooLong
      ? `Input com ${value.length} caracteres (limite: 500)`
      : hasRepetition
        ? 'Repetição suspeita de caractere detectada'
        : `Padrão de ataque detectado em input`

    logSecurityEvent('SUSPICIOUS_INPUT', detail)
  }

  return detected
}

export interface SecurityEvent {
  type: string
  detail: string
  timestamp: string
  userAgent: string
}

export function logSecurityEvent(type: string, detail: string): void {
  if (typeof window === 'undefined') return

  const event: SecurityEvent = {
    type,
    detail,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  }

  try {
    const raw = localStorage.getItem('security_log')
    const log: SecurityEvent[] = raw ? JSON.parse(raw) : []

    log.unshift(event)

    const trimmed = log.slice(0, 50)

    localStorage.setItem('security_log', JSON.stringify(trimmed))
  } catch {
  }
}

export function getSecurityLog(): SecurityEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('security_log')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
