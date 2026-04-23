import {
  generateToken,
  generateCSRFToken,
  sanitizeInput,
  detectSuspiciousInput,
  logSecurityEvent,
} from '~/composables/useSecurity'

const SESSION_KEY = 'fv_session'
const CSRF_KEY = 'csrf_token'
const RATE_KEY = 'fv_rate'
const FINGERPRINT_KEY = 'fv_fp'
const TAB_KEY = 'fv_tab'

const SESSION_TTL = 2 * 60 * 60 * 1000
const INACTIVITY_TTL = 20 * 60 * 1000

interface SessionData {
  token: string
  csrfToken: string
  createdAt: number
  lastActivity: number
  fingerprint: string
  tabId: string
  serverToken: string
}

interface RateData {
  attempts: number
  blockedUntil: number | null
  blockLevel: number
  cycleAttempts: number
}

export function useAuth() {
  const router = useRouter()

  const isAuthenticated = ref(false)
  const isVerified = ref(false)
  const isChecking = ref(false)
  const sessionExpiry = ref<number | null>(null)
  const inactivityTimer = ref<ReturnType<typeof setTimeout> | null>(null)

  async function generateFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return ''
    const raw = navigator.userAgent + navigator.language
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  function getRateData(): RateData {
    try {
      const raw = localStorage.getItem(RATE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return { attempts: 0, blockedUntil: null, blockLevel: 0, cycleAttempts: 0 }
  }

  function saveRateData(data: RateData): void {
    localStorage.setItem(RATE_KEY, JSON.stringify(data))
  }

  function checkBlock(): { blocked: boolean; remainingMs: number; level: number } {
    const rate = getRateData()
    if (rate.blockedUntil && Date.now() < rate.blockedUntil) {
      return {
        blocked: true,
        remainingMs: rate.blockedUntil - Date.now(),
        level: rate.blockLevel,
      }
    }
    if (rate.blockedUntil && Date.now() >= rate.blockedUntil) {
      rate.blockedUntil = null
      rate.attempts = 0
      saveRateData(rate)
    }
    return { blocked: false, remainingMs: 0, level: rate.blockLevel }
  }

  function recordFailedAttempt(): string {
    const rate = getRateData()
    rate.attempts += 1
    rate.cycleAttempts += 1

    let message = 'Credenciais inválidas'

    if (rate.blockLevel === 0) {
      if (rate.attempts === 4) {
        message = 'Atenção: a próxima tentativa bloqueará o acesso por 15 minutos'
      } else if (rate.attempts >= 5) {
        rate.blockedUntil = Date.now() + 15 * 60 * 1000
        rate.blockLevel = 1
        rate.attempts = 0
        logSecurityEvent('BRUTE_FORCE', `Bloqueio de 15min após ${rate.cycleAttempts} tentativas`)
        message = 'Credenciais inválidas'
      }
    } else if (rate.blockLevel === 1) {
      if (rate.attempts >= 3) {
        rate.blockedUntil = Date.now() + 60 * 60 * 1000
        rate.blockLevel = 2
        rate.attempts = 0
        logSecurityEvent('BRUTE_FORCE', `Bloqueio de 60min após reincidência`)
        message = 'Credenciais inválidas'
      }
    } else if (rate.blockLevel >= 2) {
      if (rate.attempts >= 2) {
        rate.blockedUntil = Date.now() + 24 * 60 * 60 * 1000
        rate.blockLevel = 3
        rate.attempts = 0
        logSecurityEvent('BRUTE_FORCE', `Bloqueio de 24h por reincidência grave`)
        message = 'Credenciais inválidas'
      }
    }

    saveRateData(rate)
    return message
  }

  function getBlockInfo() {
    const rate = getRateData()
    const block = checkBlock()
    const attemptsBeforeBlock =
      rate.blockLevel === 0
        ? Math.max(0, 5 - rate.attempts)
        : rate.blockLevel === 1
          ? Math.max(0, 3 - rate.attempts)
          : Math.max(0, 2 - rate.attempts)

    const levelLabels = ['', 'Bloqueio temporário', 'Bloqueio estendido', 'Bloqueio de 24h']

    return {
      ...block,
      attemptsLeft: attemptsBeforeBlock,
      levelLabel: levelLabels[rate.blockLevel] ?? 'Bloqueio',
      showWarning: rate.attempts === 4 && rate.blockLevel === 0,
    }
  }

  function artificialDelay(): Promise<void> {
    const ms = 600 + Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] ?? 0) % 601)
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function login(password: string): Promise<{ success: boolean; message: string }> {
    isChecking.value = true

    try {
      const block = checkBlock()
      if (block.blocked) {
        await artificialDelay()
        return { success: false, message: 'Credenciais inválidas' }
      }

      const sanitized = sanitizeInput(password)

      if (detectSuspiciousInput(password)) {
        const rate = getRateData()
        rate.blockedUntil = Date.now() + 30 * 60 * 1000
        rate.blockLevel = Math.max(rate.blockLevel, 1)
        saveRateData(rate)
        logSecurityEvent('ATTACK_DETECTED', 'Padrão de ataque detectado no campo de senha')
        await artificialDelay()
        return { success: false, message: 'Credenciais inválidas' }
      }

      await artificialDelay()

      let serverToken = ''
      try {
        const res = await $fetch<{ success: boolean; sessionToken: string }>(
          '/api/auth', { method: 'POST', body: { password: sanitized } }
        )
        serverToken = res.sessionToken ?? ''
      } catch (err: unknown) {
        const fetchErr = err as { statusCode?: number; message?: string }
        if (fetchErr.statusCode === 429) {
          logSecurityEvent('BRUTE_FORCE', 'Rate limit server-side atingido')
          return { success: false, message: 'Acesso temporariamente bloqueado. Tente mais tarde.' }
        }
        if (!fetchErr.statusCode) {
          return { success: false, message: 'Erro de conexão. Verifique sua internet e tente novamente.' }
        }
        const message = recordFailedAttempt()
        return { success: false, message }
      }

      const token = generateToken()
      const csrfToken = generateCSRFToken()
      const fingerprint = await generateFingerprint()
      const tabId = generateToken()
      const now = Date.now()

      const session: SessionData = {
        token,
        csrfToken,
        createdAt: now,
        lastActivity: now,
        fingerprint,
        tabId,
        serverToken,
      }

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      localStorage.setItem(TAB_KEY, JSON.stringify({ tabId, timestamp: now }))
      localStorage.removeItem(RATE_KEY)

      isAuthenticated.value = true
      sessionExpiry.value = now + SESSION_TTL

      logSecurityEvent('ACCESS', 'Login bem-sucedido no painel administrativo')

      startInactivityTimer()
      listenForMultipleTabs(tabId)

      return { success: true, message: '' }
    } finally {
      isChecking.value = false
    }
  }

  async function verifySession(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return false

      const session: SessionData = JSON.parse(raw)

      if (!session.token || !session.csrfToken) return false

      if (Date.now() - session.createdAt > SESSION_TTL) {
        logSecurityEvent('SESSION_EXPIRED', 'Sessão expirada por TTL de 2h')
        await logout('Sessão expirada. Faça login novamente.')
        return false
      }

      const storedCsrf = sessionStorage.getItem(CSRF_KEY)
      if (!storedCsrf || storedCsrf !== session.csrfToken) {
        logSecurityEvent('CSRF_MISMATCH', 'Token CSRF inválido ou ausente')
        await logout('Sessão inválida.')
        return false
      }

      const currentFp = await generateFingerprint()
      if (currentFp !== session.fingerprint) {
        logSecurityEvent('FINGERPRINT_MISMATCH', 'Fingerprint de sessão alterado — possível hijacking')
        await logout('Sessão inválida. Acesso bloqueado.')
        return false
      }

      if (session.lastActivity - Date.now() > 10 * 60 * 1000) {
        logSecurityEvent('CLOCK_MANIPULATION', 'Possível manipulação de relógio detectada')
        await logout('Sessão inválida por inconsistência de horário.')
        return false
      }

      session.lastActivity = Date.now()
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))

      isAuthenticated.value = true
      isVerified.value = true
      sessionExpiry.value = session.createdAt + SESSION_TTL
      return true
    } catch {
      return false
    }
  }

  async function logout(reason?: string): Promise<void> {
    logSecurityEvent('LOGOUT', reason ?? 'Logout voluntário')

    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) {
        const session: SessionData = JSON.parse(raw)
        session.token = ''
        session.csrfToken = ''
        session.fingerprint = ''
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      }
    } catch {}

    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(CSRF_KEY)
    localStorage.removeItem(TAB_KEY)

    isAuthenticated.value = false
    isVerified.value = false
    sessionExpiry.value = null

    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value)
      inactivityTimer.value = null
    }

    await router.push('/')
  }

  function resetInactivityTimer(): void {
    if (inactivityTimer.value) clearTimeout(inactivityTimer.value)
    inactivityTimer.value = setTimeout(() => {
      logout('Sessão encerrada por inatividade')
    }, INACTIVITY_TTL)
  }

  function startInactivityTimer(): void {
    if (typeof window === 'undefined') return
    resetInactivityTimer()
    window.addEventListener('mousemove', resetInactivityTimer, { passive: true })
    window.addEventListener('keydown', resetInactivityTimer, { passive: true })
    window.addEventListener('click', resetInactivityTimer, { passive: true })
  }

  function stopInactivityTimer(): void {
    if (typeof window === 'undefined') return
    if (inactivityTimer.value) clearTimeout(inactivityTimer.value)
    window.removeEventListener('mousemove', resetInactivityTimer)
    window.removeEventListener('keydown', resetInactivityTimer)
    window.removeEventListener('click', resetInactivityTimer)
  }

  function getInactivityRemaining(): number {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (!raw) return 0
      const session: SessionData = JSON.parse(raw)
      const elapsed = Date.now() - session.lastActivity
      return Math.max(0, Math.floor((INACTIVITY_TTL - elapsed) / 1000))
    } catch {
      return 0
    }
  }

  function listenForMultipleTabs(currentTabId: string): void {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (event) => {
      if (event.key === TAB_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue)
          if (data.tabId !== currentTabId) {
            logSecurityEvent('MULTI_TAB', 'Sessão aberta em outra aba — esta sessão foi invalidada')
            logout('Sessão encerrada: painel aberto em outra aba.')
          }
        } catch {}
      }
    })
  }

  return {
    isAuthenticated,
    isVerified,
    isChecking,
    sessionExpiry,

    login,
    logout,
    verifySession,

    checkBlock,
    getBlockInfo,

    getInactivityRemaining,
    startInactivityTimer,
    stopInactivityTimer,
  }
}
