import { sanitizeData } from '~/composables/useSecurity'

export interface Produto {
  id: string
  nome: string
  preco: number
  precoAntigo?: number
  categoria: string
  descricao: string
  imagem?: string
  destaque: boolean
  ativo: boolean
  emPromocao?: boolean
  tipo: 'produto' | 'servico' | 'medicamento'
}

export interface Promocao {
  id: string
  titulo: string
  descricao: string
  desconto: number
  validade: string
  ativo: boolean
}

export interface InfoFarmacia {
  nome: string
  slogan: string
  telefone: string
  whatsapp: string
  endereco: string
  horario: string
  email: string
}

const KEYS = {
  produtos: 'rcf_produtos',
  info:     'rcf_info',
}

const SERVICOS_RC: Produto[] = [
  { id: 'serv-1', nome: 'Consultas Farmacêuticas', preco: 0, categoria: 'Serviços Clínicos', descricao: 'Orientação profissional sobre medicamentos, interações e uso racional. Atendimento personalizado com nosso farmacêutico.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-2', nome: 'Aferição de Pressão',      preco: 0, categoria: 'Serviços Clínicos', descricao: 'Medição da pressão arterial com equipamento digital homologado. Rápido, preciso e gratuito.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-3', nome: 'Teste de Glicemia',         preco: 0, categoria: 'Serviços Clínicos', descricao: 'Monitoramento da glicose no sangue. Ideal para diabéticos e prevenção. Resultado em segundos.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-4', nome: 'Injetáveis',                preco: 0, categoria: 'Serviços Clínicos', descricao: 'Aplicação de injeções intramusculares e subcutâneas com segurança e higiene. Traga sua prescrição.', destaque: true, ativo: true, tipo: 'servico' },
  { id: 'serv-5', nome: 'Medicamentos em Geral',     preco: 0, categoria: 'Medicamentos',       descricao: 'Grande variedade de medicamentos de referência, genéricos e similares. Orientação na compra incluída.', destaque: true, ativo: true, tipo: 'servico' },
]

const INFO_PADRAO: InfoFarmacia = {
  nome:      'RC Farma',
  slogan:    'A sua farmácia clínica',
  telefone:  '(99) 981058365',
  whatsapp:  '99981058365',
  endereco:  'Rua Iraí Irmão, nº 400 - Bairro São João - Timon/MA',
  horario:   'Segunda a Sexta: 7h às 20h\nFechado aos Sábados',
  email:     '',
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(sanitizeData(data)))
  } catch {}
}

function getServerToken(): string {
  if (typeof window === 'undefined') return ''
  try {
    const raw = sessionStorage.getItem('fv_session')
    if (!raw) return ''
    return JSON.parse(raw).serverToken ?? ''
  } catch {
    return ''
  }
}

function authHeaders(): Record<string, string> {
  const token = getServerToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const produtos  = ref<Produto[]>([])
const info      = ref<InfoFarmacia>({ ...INFO_PADRAO })
let   _fetching = false

export function useStore() {

  async function init(): Promise<void> {
    const cached = loadFromStorage<Produto[]>(KEYS.produtos, [])
    if (produtos.value.length === 0) {
      produtos.value = cached.length > 0
        ? cached.map((p) => ({ ...p, tipo: p.tipo ?? (p.id.startsWith('serv-') ? 'servico' : 'produto') as Produto['tipo'] }))
        : [...SERVICOS_RC]
    }
    if (info.value.nome === INFO_PADRAO.nome) {
      info.value = loadFromStorage<InfoFarmacia | null>(KEYS.info, null) ?? { ...INFO_PADRAO }
    }

    if (_fetching) return
    _fetching = true
    try {
      const [apiProdutos, apiInfo] = await Promise.all([
        $fetch<Produto[]>('/api/produtos'),
        $fetch<InfoFarmacia>('/api/info'),
      ])
      produtos.value = apiProdutos
      info.value     = apiInfo
      saveToStorage(KEYS.produtos, apiProdutos)
      saveToStorage(KEYS.info, apiInfo)
    } catch {
    } finally {
      _fetching = false
    }
  }

  const produtosAtivos      = computed(() => produtos.value.filter((p) => p.ativo))
  const produtosDestaque    = computed(() => produtos.value.filter((p) => p.ativo && p.destaque))
  const servicosAtivos      = computed(() => produtos.value.filter((p) => p.ativo && p.tipo === 'servico'))
  const produtosEmPromocao  = computed(() => produtos.value.filter((p) => p.ativo && !!p.emPromocao))
  const produtosCatalogo    = computed(() => produtos.value.filter((p) => p.ativo && p.tipo === 'produto' && !p.emPromocao))
  const medicamentosAtivos  = computed(() => produtos.value.filter((p) => p.ativo && p.tipo === 'medicamento' && !p.emPromocao))

  async function adicionarProduto(dados: Omit<Produto, 'id'>): Promise<Produto> {
    const novo = await $fetch<Produto>('/api/produtos', {
      method:  'POST',
      headers: authHeaders(),
      body:    dados,
    })
    produtos.value.push(novo)
    saveToStorage(KEYS.produtos, produtos.value)
    return novo
  }

  async function editarProduto(id: string, dados: Partial<Omit<Produto, 'id'>>): Promise<boolean> {
    await $fetch(`/api/produtos/${id}`, {
      method:  'PUT',
      headers: authHeaders(),
      body:    dados,
    })
    const idx = produtos.value.findIndex((p) => p.id === id)
    if (idx !== -1) {
      produtos.value[idx] = { ...produtos.value[idx]!, ...dados }
      saveToStorage(KEYS.produtos, produtos.value)
    }
    return true
  }

  async function removerProduto(id: string): Promise<boolean> {
    await $fetch(`/api/produtos/${id}`, {
      method:  'DELETE',
      headers: authHeaders(),
    })
    produtos.value = produtos.value.filter((p) => p.id !== id)
    saveToStorage(KEYS.produtos, produtos.value)
    return true
  }

  function getProduto(id: string): Produto | undefined {
    return produtos.value.find((p) => p.id === id)
  }

  async function salvarInfo(dados: Partial<InfoFarmacia>): Promise<void> {
    info.value = { ...info.value, ...dados }
    await $fetch('/api/info', { method: 'POST', headers: authHeaders(), body: info.value })
    saveToStorage(KEYS.info, info.value)
  }

  return {
    produtos,
    info,

    produtosAtivos,
    produtosDestaque,
    servicosAtivos,
    produtosEmPromocao,
    produtosCatalogo,
    medicamentosAtivos,

    init,
    adicionarProduto,
    editarProduto,
    removerProduto,
    getProduto,
    salvarInfo,
  }
}
