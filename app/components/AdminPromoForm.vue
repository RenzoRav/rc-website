<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <h3 class="flex items-center gap-2 text-lg font-bold text-rc-dark mb-5">
      <TagIcon class="w-5 h-5 text-rc-red" />
      {{ editando ? 'Editar Promoção' : 'Nova Promoção' }}
    </h3>

    <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-surface-700 mb-1">Título *</label>
        <input v-model="form.titulo" type="text" maxlength="128" placeholder="Ex: Semana da Saúde" class="input-field" required />
      </div>

      <div>
        <label class="block text-sm font-semibold text-surface-700 mb-1">Descrição *</label>
        <textarea v-model="form.descricao" maxlength="500" rows="3" placeholder="Descreva a promoção..." class="input-field resize-none" required></textarea>
        <p class="text-xs text-surface-400 mt-0.5">{{ form.descricao.length }}/500</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-surface-700 mb-1">
            <span class="inline-flex items-center gap-1"><Percent class="w-3.5 h-3.5" /> Desconto (%) *</span>
          </label>
          <input v-model.number="form.desconto" type="number" min="1" max="100" placeholder="Ex: 20" class="input-field" required />
        </div>
        <div>
          <label class="block text-sm font-semibold text-surface-700 mb-1">
            <span class="inline-flex items-center gap-1"><CalendarClock class="w-3.5 h-3.5" /> Validade *</span>
          </label>
          <input v-model="form.validade" type="date" :min="today" class="input-field" required />
        </div>
      </div>

      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input v-model="form.ativo" type="checkbox" class="w-4 h-4 accent-rc-red" />
        <Eye class="w-4 h-4 text-rc-red" />
        <span class="text-sm text-surface-700">Promoção ativa (visível no site)</span>
      </label>

      <p v-if="erro" class="flex items-center gap-1.5 text-danger-600 text-sm">
        <CircleX class="w-4 h-4 shrink-0" />{{ erro }}
      </p>

      <div class="flex gap-3 pt-2">
        <button type="submit" class="inline-flex items-center gap-2 bg-rc-red hover:bg-rc-redDark text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
          <Save class="w-4 h-4" />
          {{ editando ? 'Salvar alterações' : 'Adicionar promoção' }}
        </button>
        <button type="button" @click="$emit('cancelar')" class="inline-flex items-center gap-2 bg-surface-200 hover:bg-surface-300 text-surface-700 font-semibold px-6 py-2.5 rounded-xl transition-colors">
          <X class="w-4 h-4" />
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Tag as TagIcon, Percent, CalendarClock, Eye, Save, X, CircleX } from 'lucide-vue-next'
import type { Promocao } from '~/composables/useStore'
import { sanitizeInput, detectSuspiciousInput, logSecurityEvent } from '~/composables/useSecurity'

const props = defineProps<{ promocao?: Promocao }>()
const emit = defineEmits<{ salvo: [promo: Omit<Promocao, 'id'>]; cancelar: [] }>()

const editando = computed(() => !!props.promocao)
const erro = ref('')
const today = new Date().toISOString().split('T')[0]

const form = reactive({
  titulo: props.promocao?.titulo ?? '',
  descricao: props.promocao?.descricao ?? '',
  desconto: props.promocao?.desconto ?? 10,
  validade: props.promocao?.validade ?? today,
  ativo: props.promocao?.ativo ?? true,
})

function handleSubmit() {
  erro.value = ''
  for (const field of [form.titulo, form.descricao]) {
    if (detectSuspiciousInput(field)) {
      logSecurityEvent('ATTACK_DETECTED', `Input suspeito no formulário de promoção: "${field.slice(0, 50)}"`)
      erro.value = 'Conteúdo inválido detectado. Revise os campos.'
      return
    }
  }
  if (!form.titulo.trim() || !form.descricao.trim() || !form.validade) {
    erro.value = 'Preencha todos os campos obrigatórios.'
    return
  }
  if (form.desconto < 1 || form.desconto > 100) {
    erro.value = 'Desconto deve ser entre 1% e 100%.'
    return
  }
  emit('salvo', {
    titulo: sanitizeInput(form.titulo),
    descricao: sanitizeInput(form.descricao),
    desconto: form.desconto,
    validade: form.validade,
    ativo: form.ativo,
  })
}
</script>

<style scoped>
.input-field {
  @apply w-full border border-surface-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rc-red focus:border-transparent transition;
}
</style>

