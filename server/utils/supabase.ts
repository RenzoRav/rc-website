import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client

  const config = useRuntimeConfig()
  const url = (config.supabaseUrl as string) ?? ''
  const key = (config.supabaseServiceKey as string) ?? ''

  if (!url || !key) {
    throw new Error('Supabase não configurado: defina NUXT_SUPABASE_URL e NUXT_SUPABASE_SERVICE_KEY')
  }

  _client = createClient(url, key, {
    auth: {
      persistSession:   false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return _client
}
