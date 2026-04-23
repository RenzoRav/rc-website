import { getSupabase } from './supabase'

const SESSION_TTL_MS = 2 * 60 * 60 * 1000

export async function createSession(token: string): Promise<void> {
  const supabase  = getSupabase()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  const { error } = await supabase
    .from('admin_sessions')
    .insert({ token, expires_at: expiresAt })

  if (error) throw new Error(`Erro ao criar sessão: ${error.message}`)
}

export async function verifySession(token: string): Promise<boolean> {
  if (!token) return false

  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('admin_sessions')
      .select('expires_at')
      .eq('token', token)
      .single()

    if (error || !data) return false

    if (new Date(data.expires_at) <= new Date()) {
      await supabase.from('admin_sessions').delete().eq('token', token)
      return false
    }

    return true
  } catch {
    return false
  }
}
