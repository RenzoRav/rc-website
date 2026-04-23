import { defineEventHandler, getHeader, readBody, createError, getRouterParam } from 'h3'
import { getSupabase } from '../../utils/supabase'
import { verifySession } from '../../utils/session'
import { validateProduto } from '../../utils/validate'

export default defineEventHandler(async (event) => {

  const auth  = getHeader(event, 'authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()

  if (!await verifySession(token)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id') ?? ''
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const body   = await readBody(event)
  const result = validateProduto(body)
  if (!result.ok) {
    throw createError({ statusCode: 400, statusMessage: result.error ?? 'Bad Request' })
  }

  const supabase = getSupabase()

  const { error } = await supabase
    .from('produtos')
    .update({
      nome:         body.nome.trim(),
      preco:        body.preco,
      preco_antigo: body.precoAntigo ?? null,
      categoria:    body.categoria.trim(),
      descricao:    body.descricao.trim(),
      imagem:       body.imagem ?? null,
      destaque:     body.destaque,
      ativo:        body.ativo,
      em_promocao:  body.emPromocao ?? false,
      tipo:         body.tipo,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Database error' })
  }

  return { success: true }
})
