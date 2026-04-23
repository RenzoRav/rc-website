import { defineEventHandler, getHeader, readBody, createError } from 'h3'
import { getSupabase } from '../utils/supabase'
import { verifySession } from '../utils/session'
import { validateInfo } from '../utils/validate'

export default defineEventHandler(async (event) => {
  const auth  = getHeader(event, 'authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()

  if (!await verifySession(token)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body   = await readBody<Record<string, unknown>>(event)
  const result = validateInfo(body)
  if (!result.ok) {
    throw createError({ statusCode: 400, statusMessage: result.error ?? 'Bad Request' })
  }

  const supabase = getSupabase()

  const { error } = await supabase
    .from('info_farmacia')
    .upsert({
      id:           1,
      nome:         body.nome,
      slogan:       body.slogan,
      telefone:     body.telefone,
      whatsapp:     body.whatsapp,
      endereco:     body.endereco,
      horario:      body.horario,
      email:        body.email,
      atualizado_em: new Date().toISOString(),
    })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Database error' })
  }

  return { success: true }
})
