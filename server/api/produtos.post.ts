import { defineEventHandler, getHeader, readBody, createError } from 'h3'
import { getSupabase } from '../utils/supabase'
import { verifySession } from '../utils/session'
import { validateProduto } from '../utils/validate'

export default defineEventHandler(async (event) => {
  const auth  = getHeader(event, 'authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()

  if (!await verifySession(token)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body   = await readBody(event)
  const result = validateProduto(body)
  if (!result.ok) {
    throw createError({ statusCode: 400, statusMessage: result.error ?? 'Bad Request' })
  }

  const supabase = getSupabase()
  const id       = crypto.randomUUID()

  const { data, error } = await supabase
    .from('produtos')
    .insert({
      id,
      nome:        body.nome.trim(),
      preco:       body.preco,
      preco_antigo: body.precoAntigo ?? null,
      categoria:   body.categoria.trim(),
      descricao:   body.descricao.trim(),
      imagem:      body.imagem ?? null,
      destaque:    body.destaque,
      ativo:       body.ativo,
      em_promocao: body.emPromocao ?? false,
      tipo:        body.tipo,
    })
    .select('id, nome, preco, preco_antigo, categoria, descricao, imagem, destaque, ativo, em_promocao, tipo')
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Database error' })
  }

  return {
    id:          data.id,
    nome:        data.nome,
    preco:       data.preco,
    precoAntigo: data.preco_antigo != null ? data.preco_antigo : undefined,
    categoria:   data.categoria,
    descricao:   data.descricao,
    imagem:      data.imagem ?? undefined,
    destaque:    data.destaque,
    ativo:       data.ativo,
    emPromocao:  data.em_promocao,
    tipo:        data.tipo,
  }
})
