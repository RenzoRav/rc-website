<template>
  <section id="informacoes" class="py-16 px-4 bg-rc-redDark text-white">
    <div class="container mx-auto max-w-4xl">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-extrabold">Onde nos encontrar</h2>
        <p class="text-white/60 mt-2">Estamos prontos para atender você!</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-5">
          <div class="flex items-start gap-4">
            <div class="bg-white/10 p-2.5 rounded-xl shrink-0">
              <MapPin class="w-5 h-5 text-rc-yellow" />
            </div>
            <div>
              <p class="font-semibold">Endereço</p>
              <p class="text-white/70 text-sm">{{ info.endereco }}</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="bg-white/10 p-2.5 rounded-xl shrink-0">
              <Clock class="w-5 h-5 text-rc-yellow" />
            </div>
            <div>
              <p class="font-semibold">Horário de Funcionamento</p>
              <p class="text-white/70 text-sm whitespace-pre-line">{{ info.horario }}</p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="bg-white/10 p-2.5 rounded-xl shrink-0">
              <Phone class="w-5 h-5 text-rc-yellow" />
            </div>
            <div>
              <p class="font-semibold">Telefone</p>
              <a
                :href="`tel:${info.telefone.replace(/\D/g, '')}`"
                class="text-white/70 text-sm hover:text-white transition-colors"
              >
                {{ info.telefone }}
              </a>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div class="bg-white/10 p-2.5 rounded-xl shrink-0">
              <Smartphone class="w-5 h-5 text-rc-yellow" />
            </div>
            <div>
              <p class="font-semibold">WhatsApp</p>
              <a
                :href="`https://wa.me/${info.whatsapp.replace(/\D/g, '')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-white/70 text-sm hover:text-white transition-colors"
              >
                {{ formatWhatsApp(info.whatsapp) }}
              </a>
            </div>
          </div>

          <div v-if="info.email" class="flex items-start gap-4">
            <div class="bg-white/10 p-2.5 rounded-xl shrink-0">
              <Mail class="w-5 h-5 text-rc-yellow" />
            </div>
            <div>
              <p class="font-semibold">E-mail</p>
              <a :href="`mailto:${info.email}`" class="text-white/70 text-sm hover:text-white transition-colors">
                {{ info.email }}
              </a>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
          <div class="bg-[#25D366]/20 p-5 rounded-full mb-4">
            <IconWhatsApp class="w-10 h-10 text-[#25D366]" />
          </div>
          <h3 class="text-xl font-bold mb-2">Atendimento pelo WhatsApp</h3>
          <p class="text-white/70 text-sm mb-6">
            Tire dúvidas, agende serviços e receba orientação farmacêutica diretamente no seu celular.
          </p>
          <a
            :href="`https://wa.me/${info.whatsapp.replace(/\D/g, '')}?text=Olá, gostaria de atendimento!`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-extrabold px-8 py-3 rounded-full transition-colors w-full justify-center shadow-md"
          >
            <IconWhatsApp class="w-4 h-4" />
            Iniciar conversa
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { MapPin, Clock, Phone, Smartphone, Mail } from 'lucide-vue-next'
import { useStore } from '~/composables/useStore'

const { info } = useStore()

function formatWhatsApp(num: string): string {
  const d = num.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return num
}
</script>

