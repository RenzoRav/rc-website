<template>
  <div class="min-h-screen flex flex-col bg-rc-gray">
    <NavBar />
    <HeroSection />

    <section id="servicos" class="py-16 px-4 bg-white">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-10">
          <span class="inline-flex items-center gap-1.5 bg-rc-red/10 text-rc-red text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            <Stethoscope class="w-3.5 h-3.5" />
            O que oferecemos
          </span>
          <h2 class="text-3xl font-extrabold text-rc-dark">Nossos Serviços</h2>
          <p class="text-surface-400 mt-2 text-sm">Cuidado completo para você e sua família</p>
        </div>

        <div
          v-if="servicosAtivos.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ProductCard v-for="s in servicosAtivos" :key="s.id" :produto="s" />
        </div>
        <div v-else class="text-center py-12 text-surface-400">
          <Stethoscope class="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p class="text-lg">Nenhum serviço cadastrado no momento.</p>
        </div>
      </div>
    </section>

    <section id="medicamentos" class="py-16 px-4 bg-white">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-10">
          <span class="inline-flex items-center gap-1.5 bg-rc-red/10 text-rc-red text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            <Pill class="w-3.5 h-3.5" />
            Farmácia
          </span>
          <h2 class="text-3xl font-extrabold text-rc-dark">Medicamentos</h2>
          <p class="text-surface-400 mt-2 text-sm">Referências, genéricos e similares com orientação farmacêutica</p>
        </div>

        <div
          v-if="medicamentosAtivos.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ProductCard v-for="m in medicamentosAtivos" :key="m.id" :produto="m" />
        </div>
        <div v-else class="text-center py-12 text-surface-400">
          <Pill class="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p class="text-lg">Nenhum medicamento cadastrado no momento.</p>
        </div>
      </div>
    </section>

    <section id="produtos" class="py-16 px-4 bg-rc-gray">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-10">
          <span class="inline-flex items-center gap-1.5 bg-rc-red/10 text-rc-red text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
            <ShoppingBag class="w-3.5 h-3.5" />
            Catálogo
          </span>
          <h2 class="text-3xl font-extrabold text-rc-dark">Nossos Produtos</h2>
          <p class="text-surface-400 mt-2 text-sm">Medicamentos, vitaminas, suplementos e muito mais</p>
        </div>

        <div
          v-if="produtosCatalogo.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <ProductCard v-for="p in produtosCatalogo" :key="p.id" :produto="p" />
        </div>
        <div v-else class="text-center py-12 text-surface-400">
          <ShoppingBag class="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p class="text-lg">Nenhum produto cadastrado no momento.</p>
        </div>
      </div>
    </section>

    <InfoSection />

    <footer class="bg-rc-redDark text-white/60 text-center text-xs py-8 px-4">
      <div class="flex flex-col items-center gap-2 mb-3">
        <img src="/img/image.png" alt="RC Farma" class="h-16 w-auto" />
        <p class="text-white/80 font-semibold">RC Farma — A sua farmácia clínica</p>
      </div>
      <p class="flex items-center justify-center gap-1">
        <Copyright class="w-3.5 h-3.5" />
        {{ currentYear }} RC Farma — Todos os direitos reservados.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Stethoscope, ShoppingBag, Pill, Copyright } from 'lucide-vue-next'
import { useStore } from '~/composables/useStore'

const { servicosAtivos, medicamentosAtivos, produtosCatalogo, info, init } = useStore()

onMounted(() => { init() })

const currentYear = new Date().getFullYear()

useHead({
  title: 'RC Farma — A sua farmácia clínica',
  meta: [
    { name: 'description', content: 'RC Farma: consultas farmacêuticas, aferição de pressão, glicemia, injetáveis e medicamentos. Timon/MA.' },
    { property: 'og:title', content: 'RC Farma — A sua farmácia clínica' },
    { property: 'og:description', content: 'Consultas farmacêuticas, aferição de pressão, glicemia, injetáveis e medicamentos. Timon/MA.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'pt_BR' },
    { property: 'og:url', content: 'https://rcfarma.netlify.app/' },
    { property: 'og:image', content: 'https://rcfarma.netlify.app/android-chrome-512x512.png' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: 'RC Farma — A sua farmácia clínica' },
    { name: 'twitter:description', content: 'Consultas farmacêuticas, aferição de pressão, glicemia, injetáveis e medicamentos. Timon/MA.' },
  ],
  link: [
    { rel: 'canonical', href: 'https://rcfarma.netlify.app/' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Pharmacy',
        name: 'RC Farma',
        description: 'Farmácia clínica com consultas farmacêuticas, aferição de pressão, glicemia, injetáveis e medicamentos.',
        url: 'https://rcfarma.netlify.app/',
        logo: 'https://rcfarma.netlify.app/android-chrome-512x512.png',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Timon',
          addressRegion: 'MA',
          addressCountry: 'BR',
        },
        openingHours: 'Mo-Sa 08:00-18:00',
      }),
    },
  ],
})
</script>

