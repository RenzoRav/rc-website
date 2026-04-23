interface ValidationResult {
  ok: boolean
  error?: string
}

const TIPOS_VALIDOS = ['produto', 'servico', 'medicamento'] as const

export function validateProduto(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Body inválido' }
  }
  const d = data as Record<string, unknown>

  if (typeof d.nome !== 'string' || d.nome.trim().length === 0 || d.nome.length > 200) {
    return { ok: false, error: 'nome: obrigatório, máx 200 caracteres' }
  }
  if (typeof d.preco !== 'number' || d.preco < 0 || !isFinite(d.preco)) {
    return { ok: false, error: 'preco: número não-negativo obrigatório' }
  }
  if (d.precoAntigo !== undefined && d.precoAntigo !== null) {
    if (typeof d.precoAntigo !== 'number' || d.precoAntigo < 0 || !isFinite(d.precoAntigo as number)) {
      return { ok: false, error: 'precoAntigo: número não-negativo ou omitido' }
    }
  }
  if (typeof d.categoria !== 'string' || d.categoria.trim().length === 0 || d.categoria.length > 100) {
    return { ok: false, error: 'categoria: obrigatório, máx 100 caracteres' }
  }
  if (typeof d.descricao !== 'string' || d.descricao.trim().length === 0 || d.descricao.length > 1000) {
    return { ok: false, error: 'descricao: obrigatório, máx 1000 caracteres' }
  }
  if (d.imagem !== undefined && d.imagem !== null && d.imagem !== '') {
    if (typeof d.imagem !== 'string') {
      return { ok: false, error: 'imagem: string ou omitido' }
    }
    if (d.imagem.length > 4_200_000) {
      return { ok: false, error: 'imagem: muito grande (máx 3 MB)' }
    }
    if (!d.imagem.startsWith('data:image/') && !d.imagem.startsWith('https://')) {
      return { ok: false, error: 'imagem: deve ser data URL ou HTTPS URL' }
    }
  }
  if (typeof d.destaque !== 'boolean') {
    return { ok: false, error: 'destaque: boolean obrigatório' }
  }
  if (typeof d.ativo !== 'boolean') {
    return { ok: false, error: 'ativo: boolean obrigatório' }
  }
  if (!TIPOS_VALIDOS.includes(d.tipo as typeof TIPOS_VALIDOS[number])) {
    return { ok: false, error: 'tipo: produto | servico | medicamento' }
  }

  return { ok: true }
}

export function validateInfo(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { ok: false, error: 'Body inválido' }
  }
  const d = data as Record<string, unknown>

  const strField = (key: string, max: number): ValidationResult | null => {
    if (d[key] === undefined) return null
    if (typeof d[key] !== 'string' || (d[key] as string).length > max) {
      return { ok: false, error: `${key}: string, máx ${max} caracteres` }
    }
    return null
  }

  const limits: [string, number][] = [
    ['nome',     100],
    ['slogan',   200],
    ['telefone',  50],
    ['whatsapp',  20],
    ['endereco', 300],
    ['horario',  300],
    ['email',    100],
  ]

  for (const [key, max] of limits) {
    const err = strField(key, max)
    if (err) return err
  }

  if (typeof d.whatsapp === 'string' && !/^\d*$/.test(d.whatsapp)) {
    return { ok: false, error: 'whatsapp: apenas dígitos' }
  }

  if (typeof d.email === 'string' && d.email !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) {
      return { ok: false, error: 'email: formato inválido' }
    }
  }

  return { ok: true }
}
