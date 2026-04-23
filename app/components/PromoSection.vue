<template>
  <section id="promocoes" class="py-16 px-4 bg-rc-red/5">
    <div class="container mx-auto max-w-5xl">
      <div class="text-center mb-10">
        <span class="inline-flex items-center gap-1.5 bg-rc-red text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
          <Tag class="w-3.5 h-3.5" />
          Ofertas
        </span>
        <h2 class="text-3xl font-extrabold text-rc-dark">Promoções em destaque</h2>
      </div>

      <div v-if="produtosEmPromocao.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <ProductCard v-for="p in produtosEmPromocao" :key="p.id" :produto="p" />
      </div>

      <div v-if="promocoesAtivas.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <article
          v-for="promo in promocoesAtivas"
          :key="promo.id"
          class="bg-white rounded-2xl shadow-card p-6 border-l-4 border-rc-red flex flex-col gap-3"
        >
          <div class="flex items-start justify-between gap-4">
            <h3 class="text-lg font-bold text-rc-dark">{{ promo.titulo }}</h3>
            <span class="shrink-0 inline-flex items-center gap-1 bg-rc-red text-white text-sm font-extrabold px-3 py-1 rounded-full">
              <Percent class="w-3.5 h-3.5" />
              {{ promo.desconto }}% OFF
            </span>
          </div>

          <p class="text-rc-grayDark text-sm">{{ promo.descricao }}</p>

          <p class="inline-flex items-center gap-1.5 text-xs text-surface-400 mt-auto">
            <CalendarClock class="w-3.5 h-3.5" />
            Válido até {{ formatDate(promo.validade) }}
          </p>
        </article>
      </div>

      <div v-if="produtosEmPromocao.length === 0 && promocoesAtivas.length === 0" class="text-center py-12 text-surface-400">
        <Tag class="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p class="text-lg">Nenhuma promoção ativa no momento.</p>
        <p class="text-sm">Volte em breve para conferir nossas ofertas!</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Tag, Percent, CalendarClock } from 'lucide-vue-next'
import { useStore } from '~/composables/useStore'

const { promocoesAtivas, produtosEmPromocao } = useStore()

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}
</script>

