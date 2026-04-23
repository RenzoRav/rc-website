<template>
  <div v-if="!isVerified" class="min-h-screen bg-rc-gray">
    <AdminLogin :locked-by-middleware="lockedByMiddleware" @login-success="handleLoginSuccess" />
  </div>

  <div v-else class="min-h-screen bg-rc-gray">
    <header class="bg-rc-red text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div class="flex items-center gap-3">
        <img src="/img/image.png" alt="RC Farma" class="h-12 w-auto" />
        <p class="text-white/60 text-xs">Administração</p>
      </div>

      <div class="hidden sm:flex items-center gap-6">
        <div class="flex items-center gap-1.5 text-xs text-white/60 text-right">
          <Timer class="w-3.5 h-3.5" />
          <div>
            <p>Sessão expira em</p>
            <p class="font-mono font-bold text-white">{{ sessionTimerDisplay }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-white/60 text-right">
          <Activity class="w-3.5 h-3.5" />
          <div>
            <p>Inatividade</p>
            <p
              class="font-mono font-bold"
              :class="inactivityRemaining < 180 ? 'text-rc-yellow' : 'text-white'"
            >
              {{ inactivityDisplay }}
            </p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors border border-white/20"
        >
          <LogOut class="w-4 h-4" />
          Sair
        </button>
      </div>

      <div class="sm:hidden flex items-center gap-2">
        <div
          v-if="inactivityRemaining < 300"
          class="flex items-center gap-1 text-xs text-rc-yellow font-mono font-bold"
        >
          <Activity class="w-3.5 h-3.5" />
          {{ inactivityDisplay }}
        </div>
        <button
          @click="handleLogout"
          class="inline-flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-3 py-2 rounded-xl border border-white/20"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <div class="bg-white border-b border-surface-200 px-6">
      <nav class="flex gap-0 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="abaAtiva = tab.id"
          class="inline-flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors"
          :class="
            abaAtiva === tab.id
              ? 'border-rc-red text-rc-red'
              : 'border-transparent text-surface-500 hover:text-rc-dark'
          "
        >
          <component :is="tabIcons[tab.id]" class="w-4 h-4" />
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <main class="container mx-auto max-w-5xl px-4 py-8">

      <template v-for="aba in abasCatalogo" :key="aba.id">
        <div v-if="abaAtiva === aba.id">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-extrabold text-surface-900">{{ aba.label }}</h2>
            <button
              v-if="!formProdutoVisivel"
              @click="abrirFormProduto(undefined, aba.tipo)"
              class="inline-flex items-center gap-2 bg-rc-red hover:bg-rc-redDark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus class="w-4 h-4" />
              Novo {{ aba.labelSingular }}
            </button>
          </div>

          <div v-if="formProdutoVisivel" class="mb-6">
            <AdminProductForm
              :produto="produtoEmEdicao ?? undefined"
              :tipo-inicial="tipoFormAtual"
              @salvo="salvarProduto"
              @cancelar="fecharFormProduto"
            />
          </div>

          <div class="space-y-3">
            <div
              v-for="item in itensDaAba(aba.tipo)"
              :key="item.id"
              class="bg-white rounded-xl shadow-card p-4 flex items-center gap-4"
            >
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-surface-900 truncate">{{ item.nome }}</p>
                <p class="text-xs text-surface-500">
                  {{ item.categoria }}
                  <span v-if="item.preco > 0"> · R$ {{ item.preco.toFixed(2) }}</span>
                  <span v-if="item.emPromocao" class="ml-1 text-rc-red font-bold">· Em promoção</span>
                </p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span
                  class="text-xs font-bold px-2 py-1 rounded-full"
                  :class="item.ativo ? 'bg-rc-red/10 text-rc-red' : 'bg-surface-200 text-surface-500'"
                >
                  {{ item.ativo ? 'Ativo' : 'Inativo' }}
                </span>
                <button
                  @click="abrirFormProduto(item, aba.tipo)"
                  class="inline-flex items-center gap-1 text-sm bg-surface-100 hover:bg-surface-200 text-surface-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil class="w-3.5 h-3.5" />
                  Editar
                </button>
                <template v-if="idConfirmandoRemocao === item.id">
                  <span class="text-xs text-surface-500 font-semibold">Confirmar?</span>
                  <button
                    @click="handleRemover(item.id)"
                    class="inline-flex items-center gap-1 text-sm bg-danger-500 hover:bg-danger-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                    Sim
                  </button>
                  <button
                    @click="idConfirmandoRemocao = null"
                    class="inline-flex items-center gap-1 text-sm bg-surface-200 hover:bg-surface-300 text-surface-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <X class="w-3.5 h-3.5" />
                    Não
                  </button>
                </template>
                <button
                  v-else
                  @click="idConfirmandoRemocao = item.id"
                  class="inline-flex items-center gap-1 text-sm bg-danger-50 hover:bg-danger-100 text-danger-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>
            </div>

            <div v-if="itensDaAba(aba.tipo).length === 0" class="text-center py-10 text-surface-400">
              <component :is="tabIcons[aba.id]" class="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>Nenhum {{ aba.labelSingular }} cadastrado.</p>
            </div>
          </div>
        </div>
      </template>

      <div v-if="abaAtiva === 'info'">
        <h2 class="text-xl font-extrabold text-surface-900 mb-6">Informações da Farmácia</h2>
        <div class="bg-white rounded-2xl shadow-card p-6 space-y-4">
          <div v-for="campo in camposInfo" :key="campo.key">
            <label class="block text-sm font-semibold text-surface-700 mb-1">{{ campo.label }}</label>
            <input
              v-model="infoForm[campo.key as keyof typeof infoForm]"
              :type="campo.type ?? 'text'"
              maxlength="128"
              class="w-full border border-surface-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rc-red transition"
            />
          </div>
          <p v-if="infoErro" class="text-danger-600 text-sm">{{ infoErro }}</p>
          <button
            @click="salvarInfoFarmacia"
            :disabled="infoSalvando"
            class="inline-flex items-center gap-2 bg-rc-red hover:bg-rc-redDark disabled:bg-surface-300 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl transition-colors"
          >
            <Loader2 v-if="infoSalvando" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ infoSalvando ? 'Salvando...' : 'Salvar informações' }}
          </button>
          <p v-if="infoSalvo" class="inline-flex items-center gap-1.5 text-rc-red text-sm font-semibold">
            <CircleCheck class="w-4 h-4" />
            Informações salvas com sucesso!
          </p>
        </div>
      </div>

      <div v-if="abaAtiva === 'log'">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-extrabold text-surface-900">Log de Segurança</h2>
          <span class="text-xs text-surface-400">Últimos {{ securityLog.length }} eventos</span>
        </div>

        <div class="space-y-2">
          <div
            v-for="(event, i) in securityLog"
            :key="i"
            class="bg-white rounded-xl shadow-card p-4 flex items-start gap-3"
          >
            <component
              :is="eventIcon(event.type)"
              class="w-4 h-4 mt-0.5 shrink-0"
              :class="eventIconColor(event.type)"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="text-xs font-bold px-2 py-0.5 rounded-full"
                  :class="eventClass(event.type)"
                >
                  {{ event.type }}
                </span>
                <span class="text-xs text-surface-400">{{ formatTimestamp(event.timestamp) }}</span>
              </div>
              <p class="text-sm text-surface-700 mt-1">{{ event.detail }}</p>
            </div>
          </div>

          <div v-if="securityLog.length === 0" class="text-center py-10 text-surface-400">
            <ShieldCheck class="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p>Nenhum evento de segurança registrado.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  LogOut, Timer, Activity,
  Package, Pill, Stethoscope, Store, ShieldCheck,
  Plus, Pencil, Trash2, Save, CircleCheck, X, Loader2,
  CircleCheckBig, DoorOpen, Hammer, TriangleAlert,
  Search, Wrench, Clock, Fingerprint, Shield, Layers, AlarmClock,
  ClipboardList,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { Produto } from '~/composables/useStore'
import { useStore } from '~/composables/useStore'
import { getSecurityLog, sanitizeInput, detectSuspiciousInput, logSecurityEvent } from '~/composables/useSecurity'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Painel Administrativo — RC Farma' })

const route = useRoute()
const { isVerified, isAuthenticated, logout, verifySession, sessionExpiry, getInactivityRemaining, startInactivityTimer } = useAuth()
const { produtos, info, init, adicionarProduto, editarProduto, removerProduto, salvarInfo } = useStore()

const lockedByMiddleware = computed(() => route.query.locked === 'true')


onMounted(async () => {
  init()

  const hasExistingSession = !!sessionStorage.getItem('fv_session')

  const valid = await verifySession()
  if (!valid) {
    if (hasExistingSession) {
      await logout('Sessão inválida ao carregar o painel.')
    }
    return
  }

  Object.assign(infoForm, info.value)

  startInactivityTimer()

  securityLog.value = getSecurityLog()

  timerInterval = setInterval(() => {
    tickTimers()
    inactivityRemaining.value = getInactivityRemaining()
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})


let timerInterval: ReturnType<typeof setInterval> | null = null
const inactivityRemaining = ref(getInactivityRemaining())

const sessionTimerDisplay = computed(() => {
  if (!sessionExpiry.value) return '--:--'
  const ms = sessionExpiry.value - Date.now()
  if (ms <= 0) return '00:00'
  const totalMin = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  return `${String(totalMin).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

const inactivityDisplay = computed(() => {
  const s = inactivityRemaining.value
  const min = Math.floor(s / 60)
  const sec = s % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

function tickTimers() {
  inactivityRemaining.value = getInactivityRemaining()
}


async function handleLogout() {
  if (timerInterval) clearInterval(timerInterval)
  await logout('Logout voluntário pelo painel.')
}


async function handleLoginSuccess() {
  const valid = await verifySession()
  if (!valid) return

  Object.assign(infoForm, info.value)
  startInactivityTimer()
  securityLog.value = getSecurityLog()

  timerInterval = setInterval(() => {
    tickTimers()
    inactivityRemaining.value = getInactivityRemaining()
  }, 1000)
}


const abaAtiva = ref<'produtos' | 'servicos' | 'medicamentos' | 'info' | 'log'>('produtos')

const abasCatalogo = [
  { id: 'produtos',     label: 'Produtos',     labelSingular: 'produto',     tipo: 'produto'     as const },
  { id: 'servicos',     label: 'Serviços',     labelSingular: 'serviço',     tipo: 'servico'     as const },
  { id: 'medicamentos', label: 'Medicamentos', labelSingular: 'medicamento', tipo: 'medicamento' as const },
]

const tabs = [
  { id: 'produtos',     label: 'Produtos'     },
  { id: 'servicos',     label: 'Serviços'     },
  { id: 'medicamentos', label: 'Medicamentos' },
  { id: 'info',         label: 'Informações'  },
  { id: 'log',          label: 'Log de Segurança' },
] as const

const tabIcons: Record<string, Component> = {
  produtos:     Package,
  servicos:     Stethoscope,
  medicamentos: Pill,
  info:         Store,
  log:          ShieldCheck,
}

function itensDaAba(tipo: 'produto' | 'servico' | 'medicamento') {
  return produtos.value.filter((p) => p.tipo === tipo)
}


const formProdutoVisivel   = ref(false)
const produtoEmEdicao      = ref<Produto | null>(null)
const tipoFormAtual        = ref<'produto' | 'servico' | 'medicamento'>('produto')
const idConfirmandoRemocao = ref<string | null>(null)
const formSalvando         = ref(false)
const erroForm             = ref('')

function abrirFormProduto(produto?: Produto, tipo: 'produto' | 'servico' | 'medicamento' = 'produto') {
  produtoEmEdicao.value = produto ?? null
  tipoFormAtual.value   = produto?.tipo ?? tipo
  formProdutoVisivel.value = true
}

function fecharFormProduto() {
  formProdutoVisivel.value = false
  produtoEmEdicao.value    = null
}

async function salvarProduto(dados: Omit<Produto, 'id'>) {
  formSalvando.value = true
  erroForm.value = ''
  try {
    if (produtoEmEdicao.value) {
      await editarProduto(produtoEmEdicao.value.id, dados)
    } else {
      await adicionarProduto(dados)
    }
    fecharFormProduto()
  } catch {
    erroForm.value = 'Erro ao salvar. Verifique sua conexão e tente novamente.'
  } finally {
    formSalvando.value = false
  }
}

async function handleRemover(id: string) {
  idConfirmandoRemocao.value = null
  try {
    await removerProduto(id)
  } catch {
  }
}


const infoErro    = ref('')
const infoSalvo   = ref(false)
const infoSalvando = ref(false)

const infoForm = reactive({ ...info.value })

const camposInfo = [
  { key: 'nome',     label: 'Nome da farmácia' },
  { key: 'slogan',   label: 'Slogan' },
  { key: 'telefone', label: 'Telefone / WhatsApp' },
  { key: 'whatsapp', label: 'Número WhatsApp (somente dígitos)' },
  { key: 'endereco', label: 'Endereço completo' },
  { key: 'horario',  label: 'Horário de funcionamento' },
  { key: 'email',    label: 'E-mail', type: 'email' },
]

async function salvarInfoFarmacia() {
  if (infoSalvando.value) return
  infoErro.value = ''
  infoSalvo.value = false
  infoSalvando.value = true

  for (const [key, value] of Object.entries(infoForm)) {
    if (detectSuspiciousInput(String(value))) {
      logSecurityEvent('ATTACK_DETECTED', `Input suspeito no campo de informações: ${key}`)
      infoErro.value = 'Conteúdo inválido detectado. Revise os campos.'
      infoSalvando.value = false
      return
    }
  }

  try {
    await salvarInfo({
      nome:      sanitizeInput(infoForm.nome),
      slogan:    sanitizeInput(infoForm.slogan ?? ''),
      telefone:  sanitizeInput(infoForm.telefone),
      whatsapp:  sanitizeInput(infoForm.whatsapp),
      endereco:  sanitizeInput(infoForm.endereco),
      horario:   sanitizeInput(infoForm.horario),
      email:     sanitizeInput(infoForm.email),
    })
    infoSalvo.value = true
    setTimeout(() => (infoSalvo.value = false), 3000)
  } catch {
    infoErro.value = 'Erro ao salvar. Verifique sua conexão e tente novamente.'
  } finally {
    infoSalvando.value = false
  }
}


const securityLog = ref(getSecurityLog())

watch(abaAtiva, (aba) => {
  if (aba === 'log') securityLog.value = getSecurityLog()
})

function eventIcon(type: string): Component {
  const map: Record<string, Component> = {
    ACCESS: CircleCheckBig,
    LOGOUT: DoorOpen,
    BRUTE_FORCE: Hammer,
    ATTACK_DETECTED: TriangleAlert,
    SUSPICIOUS_INPUT: Search,
    DEVTOOLS_DETECTED: Wrench,
    SESSION_EXPIRED: Clock,
    FINGERPRINT_MISMATCH: Fingerprint,
    CSRF_MISMATCH: Shield,
    MULTI_TAB: Layers,
    CLOCK_MANIPULATION: AlarmClock,
  }
  return map[type] ?? ClipboardList
}

function eventIconColor(type: string): string {
  if (['BRUTE_FORCE', 'ATTACK_DETECTED', 'FINGERPRINT_MISMATCH', 'CSRF_MISMATCH'].includes(type)) {
    return 'text-danger-500'
  }
  if (['ACCESS', 'LOGOUT'].includes(type)) {
    return 'text-rc-red'
  }
  return 'text-surface-400'
}

function eventClass(type: string): string {
  if (['BRUTE_FORCE', 'ATTACK_DETECTED', 'FINGERPRINT_MISMATCH', 'CSRF_MISMATCH'].includes(type)) {
    return 'bg-danger-100 text-danger-700'
  }
  if (['ACCESS', 'LOGOUT'].includes(type)) {
    return 'bg-rc-red/10 text-rc-red'
  }
  return 'bg-surface-100 text-surface-600'
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR')
  } catch {
    return iso
  }
}
</script>

