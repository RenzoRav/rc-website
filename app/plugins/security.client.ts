import { logSecurityEvent } from '~/composables/useSecurity'

const SESSION_KEY = 'fv_session'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const { logout, verifySession } = useAuth()

  document.addEventListener('contextmenu', (e) => {
    if (window.location.pathname === '/admin') {
      e.preventDefault()
    }
  })

  function checkDevTools(): void {
    if (window.location.pathname !== '/admin') return

    const threshold = 160
    const devToolsOpen =
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold

    if (devToolsOpen && sessionStorage.getItem(SESSION_KEY)) {
      logSecurityEvent('DEVTOOLS_DETECTED', 'DevTools detectado no painel administrativo')
      logout('Sessão encerrada: acesso ao painel de desenvolvimento detectado.')
    }
  }

  let devToolsInterval: ReturnType<typeof setInterval> | null = null

  router.afterEach((to) => {
    if (to.path === '/admin') {
      devToolsInterval = setInterval(checkDevTools, 2000)
    } else {
      if (devToolsInterval) {
        clearInterval(devToolsInterval)
        devToolsInterval = null
      }
    }
  })

  let hiddenAt: number | null = null

  document.addEventListener('visibilitychange', async () => {
    if (window.location.pathname !== '/admin') return

    if (document.hidden) {
      hiddenAt = Date.now()
    } else if (hiddenAt !== null) {
      const hiddenFor = Date.now() - hiddenAt
      hiddenAt = null

      if (hiddenFor > 30 * 60 * 1000 && sessionStorage.getItem(SESSION_KEY)) {
        const valid = await verifySession()
        if (!valid) {
          await logout('Sessão expirada durante inatividade prolongada.')
        }
      }
    }
  })
})
