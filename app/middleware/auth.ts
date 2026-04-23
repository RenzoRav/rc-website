import { logSecurityEvent } from '~/composables/useSecurity'

export default defineNuxtRouteMiddleware(async (to) => {

  if (to.path !== '/admin') return

  if (to.query.locked === 'true') return

  if (import.meta.server) return

  try {
    const { verifySession } = useAuth()
    const valid = await verifySession()

    if (!valid) {
      return navigateTo('/admin?locked=true')
    }

    logSecurityEvent('ACCESS', `Acesso autorizado ao painel: ${to.fullPath}`)
  } catch {
    return navigateTo('/admin?locked=true')
  }
})

