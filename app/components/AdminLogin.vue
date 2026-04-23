<template>
  <div class="min-h-screen bg-rc-gray flex items-center justify-center px-4">
    <div class="bg-white rounded-2xl shadow-card w-full max-w-md p-8 border border-rc-red/10">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-extrabold text-rc-red">RC Farma</h1>
        <p class="text-surface-400 text-sm">Painel Administrativo</p>
      </div>

      <div
        v-if="lockedByMiddleware"
        class="flex items-start gap-2 bg-danger-50 border border-danger-300 text-danger-700 text-sm px-4 py-3 rounded-xl mb-6"
      >
        <ShieldAlert class="w-4 h-4 mt-0.5 shrink-0" />
        <span><strong>Acesso negado</strong> — sessão inválida ou expirada.</span>
      </div>

      <div
        v-if="blockInfo.blocked"
        class="bg-danger-50 border border-danger-300 text-danger-700 px-4 py-3 rounded-xl mb-6"
      >
        <p class="flex items-center gap-2 font-bold text-sm mb-1">
          <LockKeyhole class="w-4 h-4" />
          {{ blockInfo.levelLabel }}
        </p>
        <p class="text-sm">
          Acesso liberado em:
          <span class="font-mono font-bold">{{ countdownDisplay }}</span>
        </p>
      </div>

      <div
        v-else-if="blockInfo.showWarning"
        class="flex items-start gap-2 bg-yellow-50 border border-yellow-300 text-yellow-700 text-sm px-4 py-3 rounded-xl mb-6"
      >
        <TriangleAlert class="w-4 h-4 mt-0.5 shrink-0" />
        <span><strong>Atenção:</strong> a próxima tentativa bloqueará o acesso por 15 minutos.</span>
      </div>

      <div
        v-if="errorMessage"
        class="flex items-start gap-2 bg-danger-50 border border-danger-300 text-danger-700 text-sm px-4 py-3 rounded-xl mb-6"
      >
        <CircleX class="w-4 h-4 mt-0.5 shrink-0" />
        <span>{{ errorMessage }}</span>
      </div>

      <form v-if="!blockInfo.blocked" @submit.prevent="handleLogin" novalidate>
        <div class="mb-5">
          <label for="senha" class="block text-sm font-semibold text-rc-grayDark mb-1">
            Senha de acesso
          </label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              <KeyRound class="w-4 h-4" />
            </div>
            <input
              id="senha"
              v-model="senha"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Digite a senha"
              class="w-full border border-surface-300 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rc-red focus:border-transparent transition"
              :disabled="isChecking || blockInfo.blocked"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-rc-red transition-colors"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>

          <p
            v-if="!blockInfo.blocked && blockInfo.attemptsLeft < 5 && blockInfo.attemptsLeft > 0"
            class="flex items-center gap-1 text-xs text-surface-400 mt-1"
          >
            <Info class="w-3 h-3" />
            {{ blockInfo.attemptsLeft }} tentativa{{ blockInfo.attemptsLeft !== 1 ? 's' : '' }} restante{{ blockInfo.attemptsLeft !== 1 ? 's' : '' }} antes do bloqueio
          </p>
        </div>

        <button
          type="submit"
          :disabled="isChecking || blockInfo.blocked || !senha"
          class="w-full bg-rc-red hover:bg-rc-redDark disabled:bg-surface-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isChecking" class="w-4 h-4 animate-spin" />
          <LogIn v-else class="w-4 h-4" />
          <span>{{ isChecking ? 'Verificando...' : 'Entrar' }}</span>
        </button>
      </form>

      <p class="flex items-center justify-center gap-1.5 text-center text-xs text-surface-300 mt-6">
        <ShieldCheck class="w-3.5 h-3.5" />
        Acesso restrito a administradores autorizados
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Eye, EyeOff, KeyRound, Loader2, LogIn,
  ShieldAlert, ShieldCheck, LockKeyhole, TriangleAlert, CircleX, Info,
} from 'lucide-vue-next'

defineProps<{ lockedByMiddleware?: boolean }>()
const emit = defineEmits<{ loginSuccess: [] }>()

const { login, isChecking, getBlockInfo } = useAuth()

const senha = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const blockInfo = ref(getBlockInfo())

let blockInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => { blockInterval = setInterval(() => { blockInfo.value = getBlockInfo() }, 500) })
onUnmounted(() => { if (blockInterval) clearInterval(blockInterval) })

const countdownDisplay = computed(() => {
  const ms = blockInfo.value.remainingMs
  if (ms <= 0) return '00:00'
  const totalSec = Math.ceil(ms / 1000)
  return `${String(Math.floor(totalSec / 60)).padStart(2, '0')}:${String(totalSec % 60).padStart(2, '0')}`
})

async function handleLogin() {
  if (!senha.value || isChecking.value) return
  errorMessage.value = ''
  const result = await login(senha.value)
  if (result.success) {
    emit('loginSuccess')
  } else {
    errorMessage.value = result.message
    senha.value = ''
    blockInfo.value = getBlockInfo()
  }
}
</script>

