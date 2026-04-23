import { defineEventHandler, getHeader, createError, getRouterParam } from 'h3'
import { getSupabase } from '../../utils/supabase'
import { verifySession } from '../../utils/session'

export default defineEventHandler(async (event) => {

  const auth  = getHeader(event, 'authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()

  if (!await verifySession(token)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id') ?? ''
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const supabase = getSupabase()

  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Database error' })
  }

  return { success: true }
})
