import { defineEventHandler } from 'h3'
import { getSupabase } from '../utils/supabase'

const DEFAULTS = [
  { id: 'serv-1', nome: 'Consultas Farmacêuticas', preco: 0, categoria: 'Serviços Clínicos', descricao: 'Orientação profissional sobre medicamentos, interações e uso racional. Atendimento personalizado com nosso farmacêutico.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-2', nome: 'Aferição de Pressão',      preco: 0, categoria: 'Serviços Clínicos', descricao: 'Medição da pressão arterial com equipamento digital homologado. Rápido, preciso e gratuito.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-3', nome: 'Teste de Glicemia',         preco: 0, categoria: 'Serviços Clínicos', descricao: 'Monitoramento da glicose no sangue. Ideal para diabéticos e prevenção. Resultado em segundos.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-4', nome: 'Injetáveis',                preco: 0, categoria: 'Serviços Clínicos', descricao: 'Aplicação de injeções intramusculares e subcutâneas com segurança e higiene. Traga sua prescrição.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-5', nome: 'Medicamentos em Geral',     preco: 0, categoria: 'Medicamentos',       descricao: 'Grande variedade de medicamentos de referência, genéricos e similares. Orientação na compra incluída.', destaque: true, ativo: true, tipo: 'servico' },
]

function rowToProduct(row: Record<string, unknown>) {
  return {
    id:          row.id          as string,
    nome:        row.nome        as string,
    preco:       row.preco       as number,
    precoAntigo: row.preco_antigo != null ? (row.preco_antigo as number) : undefined,
    categoria:   row.categoria   as string,
    descricao:   row.descricao   as string,
    imagem:      row.imagem      as string | undefined,
    destaque:    row.destaque    as boolean,
    ativo:       row.ativo       as boolean,
    emPromocao:  row.em_promocao as boolean,
    tipo:        row.tipo        as 'produto' | 'servico' | 'medicamento',
  }
}

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, preco, preco_antigo, categoria, descricao, imagem, destaque, ativo, em_promocao, tipo')
      .order('criado_em', { ascending: true })

    if (error) throw error
    if (!data || data.length === 0) return DEFAULTS

    return data.map(rowToProduct)
  } catch {
    return DEFAULTS
  }
})
