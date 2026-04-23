<template>
  <nav
    aria-label="Navegação principal"
    class="bg-rc-red sticky top-0 z-50 transition-shadow duration-300"
    :class="scrolled ? 'shadow-[0_2px_12px_rgba(0,0,0,0.18)]' : 'shadow-none'"
  >
    <div class="container mx-auto px-5 flex items-center justify-between h-20">
  <a href="/" class="flex items-center hover:opacity-90 transition-opacity shrink-0">
    <img
      src="/img/image.png"
      alt="RC Farma"
      class="h-16 w-auto object-contain"
    />
  </a>

      <ul class="hidden md:flex items-center gap-7">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href"
            class="text-white/85 hover:text-white text-sm font-semibold tracking-wide transition-colors relative group">
            {{ link.label }}
            <span
              class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-rc-yellow rounded-full transition-all group-hover:w-full" />
          </a>
        </li>
      </ul>

      <a :href="`https://wa.me/${whatsappNumber}`" target="_blank" rel="noopener noreferrer"
        class="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-bold px-4 py-2 rounded-full transition-colors shrink-0"
        style="box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <IconWhatsApp class="w-4 h-4 shrink-0" />
        <span class="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStore } from '~/composables/useStore'

const { info } = useStore()
const whatsappNumber = computed(() => info.value.whatsapp.replace(/\D/g, ''))

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const navLinks = [
  { href: '#servicos',    label: 'Serviços'     },
  { href: '#medicamentos', label: 'Medicamentos' },
  { href: '#produtos',    label: 'Produtos'      },
  { href: '#informacoes', label: 'Informações'   },
]
</script>
