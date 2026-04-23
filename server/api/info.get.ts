import { defineEventHandler } from 'h3'
import { getSupabase } from '../utils/supabase'

const INFO_PADRAO = {
  nome:     'RC Farma',
  slogan:   'A sua farmácia clínica',
  telefone: '(99) 981058365',
  whatsapp: '99981058365',
  endereco: 'Rua Iraí Irmão, nº 400 - Bairro São João - Timon/MA',
  horario:  'Segunda a Sexta: 7h às 20h\nFechado aos Sábados',
  email:    '',
}

export default defineEventHandler(async () => {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('info_farmacia')
      .select('nome, slogan, telefone, whatsapp, endereco, horario, email')
      .eq('id', 1)
      .single()

    if (error || !data) return INFO_PADRAO

    return {
      nome:     data.nome,
      slogan:   data.slogan,
      telefone: data.telefone,
      whatsapp: data.whatsapp,
      endereco: data.endereco,
      horario:  data.horario,
      email:    data.email,
    }
  } catch {
    return INFO_PADRAO
  }
})
