<template>
  <section class="bg-gradient-to-br from-rc-red via-rc-red to-rc-redDark text-white py-16 px-4 relative overflow-hidden">
    <div class="absolute inset-0 opacity-5 pointer-events-none select-none" aria-hidden="true">
      <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full border-4 border-white"></div>
      <div class="absolute -bottom-10 -left-10 w-64 h-64 rounded-full border-4 border-white"></div>
    </div>

    <div class="container mx-auto max-w-5xl relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

        <div>
          <div class="mb-5">
            <span class="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
              <Pill class="w-3.5 h-3.5 text-rc-yellow" />
              A sua farmácia clínica
            </span>
            <h1 class="text-4xl md:text-5xl font-extrabold leading-tight">
              <span class="block text-white">Uma Farmácia</span>
              <span class="block text-rc-yellow drop-shadow-sm">COMPLETA</span>
              <span class="block text-white text-3xl md:text-4xl font-bold mt-1">Para Você e Sua Família</span>
            </h1>
          </div>

          <ul class="space-y-2 mb-7">
            <li
              v-for="servico in servicosDestaque"
              :key="servico.id"
              class="flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle class="w-4 h-4 text-rc-yellow shrink-0" />
              <span>{{ servico.nome }}</span>
            </li>
          </ul>

          <div class="flex flex-col sm:flex-row gap-3">
            <a
              href="#servicos"
              class="inline-flex items-center justify-center gap-2 bg-white text-rc-red font-extrabold px-7 py-3 rounded-full hover:bg-rc-gray transition-colors shadow-md"
            >
              <Stethoscope class="w-5 h-5" />
              Ver Serviços
            </a>
            <a
              :href="`https://wa.me/${whatsappNumber}?text=Olá, gostaria de mais informações sobre a RC Farma!`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-extrabold px-7 py-3 rounded-full transition-colors shadow-md"
            >
              <IconWhatsApp class="w-5 h-5" />
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <div class="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
            <div class="flex items-center gap-2 mb-3">
              <Clock class="w-5 h-5 text-rc-yellow" />
              <span class="font-bold text-rc-yellow uppercase tracking-wide text-xs">Horário de Funcionamento</span>
            </div>
            <p class="text-white text-sm font-semibold whitespace-pre-line leading-relaxed">{{ info.horario }}</p>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
              <ShieldCheck class="w-6 h-6 text-rc-yellow mx-auto mb-1" />
              <p class="text-xs font-semibold leading-tight">Produtos<br/>Originais</p>
            </div>
            <div class="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
              <UserCheck class="w-6 h-6 text-rc-yellow mx-auto mb-1" />
              <p class="text-xs font-semibold leading-tight">Atendimento<br/>Especializado</p>
            </div>
            <div class="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
              <Heart class="w-6 h-6 text-rc-yellow mx-auto mb-1" />
              <p class="text-xs font-semibold leading-tight">Cuidado<br/>com Você</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Pill, CheckCircle, Clock, ShieldCheck, Stethoscope, UserCheck, Heart } from 'lucide-vue-next'
import { useStore } from '~/composables/useStore'

const { info, produtosDestaque } = useStore()

const servicosDestaque = computed(() => produtosDestaque.value.slice(0, 5))

const whatsappNumber = computed(() => info.value.whatsapp.replace(/\D/g, ''))
</script>

