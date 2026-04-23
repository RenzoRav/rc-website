<template>
  <article
    class="rounded-2xl shadow-card hover:shadow-card-hover transition-shadow overflow-hidden flex flex-col"
    :class="produto.emPromocao
      ? 'bg-gradient-to-b from-rc-red/5 to-white border-2 border-rc-red'
      : 'bg-white border border-rc-red/10'"
  >
    <div
      class="relative h-44 flex items-center justify-center overflow-hidden"
      :class="produto.tipo === 'servico' ? 'bg-rc-gray' : 'bg-white'"
    >
      <img
        v-if="produto.imagem"
        :src="produto.imagem"
        :alt="produto.nome"
        :class="produto.tipo === 'servico' ? 'h-full w-full object-cover' : 'h-full w-full object-contain p-2'"
        loading="lazy"
      />
      <div v-else class="flex flex-col items-center gap-2 text-rc-red/30">
        <Stethoscope class="w-14 h-14" />
      </div>
      <div
        v-if="produto.emPromocao"
        class="absolute top-2 left-2 inline-flex items-center gap-1 bg-rc-red text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow"
      >
        <Tag class="w-3 h-3" />
        PROMOÇÃO
      </div>
    </div>

    <div class="p-4 flex flex-col flex-1">
      <span class="text-xs text-rc-red font-bold uppercase tracking-wide mb-1">
        {{ produto.categoria }}
      </span>

      <h3 class="text-rc-dark font-bold text-base leading-snug mb-2 flex-1">
        {{ produto.nome }}
      </h3>

      <p class="text-surface-400 text-sm line-clamp-2 mb-3">{{ produto.descricao }}</p>

      <div v-if="produto.preco > 0" class="flex items-baseline gap-2 mb-4">
        <span class="text-rc-red font-extrabold text-xl">
          R$ {{ formatPrice(produto.preco) }}
        </span>
        <span v-if="produto.precoAntigo" class="text-surface-400 text-sm line-through">
          R$ {{ formatPrice(produto.precoAntigo) }}
        </span>
        <span
          v-if="produto.precoAntigo"
          class="inline-flex items-center gap-0.5 bg-rc-yellow/20 text-rc-dark text-xs font-bold px-2 py-0.5 rounded-full"
        >
          <TrendingDown class="w-3 h-3" />
          {{ discountPercent }}%
        </span>
      </div>
      <div v-else class="mb-4">
        <span class="inline-flex items-center gap-1 bg-rc-red/10 text-rc-red text-xs font-bold px-3 py-1 rounded-full">
          <CheckCircle class="w-3.5 h-3.5" />
          Serviço disponível
        </span>
      </div>

      <a
        v-if="produto.tipo === 'servico'"
        :href="`https://wa.me/${whatsappNumber}?text=Olá, gostaria de saber mais sobre: ${produto.nome}`"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
      >
        <IconWhatsApp class="w-4 h-4" />
        Falar no WhatsApp
      </a>
    </div>
  </article>
</template>

<script setup lang="ts">
import { Stethoscope, TrendingDown, CheckCircle, Tag } from 'lucide-vue-next'
import type { Produto } from '~/composables/useStore'
import { useStore } from '~/composables/useStore'

const props = defineProps<{ produto: Produto }>()

const { info } = useStore()
const whatsappNumber = computed(() => info.value.whatsapp.replace(/\D/g, ''))

function formatPrice(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

const discountPercent = computed(() => {
  if (!props.produto.precoAntigo) return 0
  return Math.round(((props.produto.precoAntigo - props.produto.preco) / props.produto.precoAntigo) * 100)
})
</script>

