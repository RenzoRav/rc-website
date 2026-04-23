<template>
  <div class="bg-white rounded-2xl shadow-card p-6">
    <h3 class="flex items-center gap-2 text-lg font-bold text-rc-dark mb-5">
      <PackagePlus v-if="!editando" class="w-5 h-5 text-rc-red" />
      <PackageOpen v-else class="w-5 h-5 text-rc-red" />
      {{ editando ? 'Editar Produto' : 'Novo Produto' }}
    </h3>

    <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
      <div>
        <label class="block text-sm font-semibold text-surface-700 mb-1">Tipo</label>
        <select v-model="form.tipo" class="input-field">
          <option value="produto">Produto</option>
          <option value="medicamento">Medicamento</option>
          <option value="servico">Serviço</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold text-surface-700 mb-1">Nome do produto *</label>
        <input v-model="form.nome" type="text" maxlength="128" placeholder="Ex: Vitamina C 1000mg" class="input-field" />
      </div>

      <div>
        <label class="block text-sm font-semibold text-surface-700 mb-1">Categoria *</label>
        <input v-model="form.categoria" type="text" maxlength="128" placeholder="Ex: Vitaminas e Suplementos" class="input-field" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-surface-700 mb-1">Preço atual (R$) *</label>
          <input v-model.number="form.preco" type="number" min="0" step="0.01" placeholder="0,00" class="input-field" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-surface-700 mb-1">Preço antigo (R$)</label>
          <input v-model.number="form.precoAntigo" type="number" min="0" step="0.01" placeholder="Opcional" class="input-field" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-semibold text-surface-700 mb-1">Descrição *</label>
        <textarea v-model="form.descricao" maxlength="500" rows="3" placeholder="Descreva o produto..." class="input-field resize-none"></textarea>
        <p class="text-xs text-surface-400 mt-0.5" aria-live="polite" aria-atomic="true">{{ form.descricao.length }}/500</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-surface-700 mb-2">Imagem do produto</label>

        <div class="flex gap-2 mb-3">
          <button
            type="button"
            @click="modoImagem = 'upload'"
            class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            :class="modoImagem === 'upload' ? 'bg-rc-red text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
          >
            <ImageUp class="w-3.5 h-3.5" />
            Arquivo
          </button>
          <button
            type="button"
            @click="modoImagem = 'url'"
            class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            :class="modoImagem === 'url' ? 'bg-rc-red text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'"
          >
            <Link class="w-3.5 h-3.5" />
            URL
          </button>
        </div>

        <div v-if="modoImagem === 'upload'">
          <div
            class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
            :class="arrastando ? 'border-rc-red bg-rc-red/5' : 'border-surface-300 hover:border-rc-red'"
            @click="inputFileRef?.click()"
            @dragover.prevent="arrastando = true"
            @dragleave.prevent="arrastando = false"
            @drop.prevent="handleDrop"
          >
            <Loader2 v-if="processando" class="w-8 h-8 mx-auto mb-2 text-rc-red animate-spin" />
            <ImageUp v-else class="w-8 h-8 mx-auto mb-2 text-surface-400" />
            <p class="text-sm font-medium text-surface-600">
              {{ processando ? 'Processando...' : 'Clique ou arraste uma imagem' }}
            </p>
            <p class="text-xs text-surface-400 mt-1">JPG, PNG, WebP · máx. 4 MB</p>
          </div>
          <input
            ref="inputFileRef"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleFile"
          />
        </div>

        <div v-if="modoImagem === 'url'" class="flex gap-2">
          <input
            v-model="urlInput"
            type="url"
            placeholder="https://..."
            class="input-field flex-1"
            @keydown.enter.prevent="aplicarUrl"
          />
          <button
            type="button"
            @click="aplicarUrl"
            class="inline-flex items-center gap-1 bg-rc-red hover:bg-rc-redDark text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            <Check class="w-4 h-4" />
          </button>
        </div>

        <div v-if="form.imagem" class="mt-3 relative group">
          <img
            :src="form.imagem"
            alt="Preview"
            class="w-full max-h-48 object-contain rounded-xl border border-surface-200 bg-surface-50"
            @error="erroImagem = 'Não foi possível carregar a imagem.'; form.imagem = ''"
          />
          <button
            type="button"
            @click="removerImagem"
            title="Remover imagem"
            class="absolute top-2 right-2 bg-danger-500 hover:bg-danger-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X class="w-3.5 h-3.5" />
          </button>
          <p class="text-xs text-surface-400 mt-1 text-right">
            {{ form.imagem.startsWith('data:') ? `Arquivo local · ~${Math.round(form.imagem.length * 0.75 / 1024)} KB` : 'URL externa' }}
          </p>
        </div>

        <p v-if="erroImagem" class="flex items-center gap-1.5 text-danger-600 text-xs mt-1.5">
          <CircleX class="w-3.5 h-3.5 shrink-0" />{{ erroImagem }}
        </p>
      </div>

      <div class="flex items-center gap-6 flex-wrap">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="form.emPromocao" type="checkbox" class="w-4 h-4 accent-rc-red" />
          <Tag class="w-4 h-4 text-rc-red" />
          <span class="text-sm text-surface-700">Em promoção</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="form.destaque" type="checkbox" class="w-4 h-4 accent-rc-red" />
          <Star class="w-4 h-4 text-rc-yellow" />
          <span class="text-sm text-surface-700">Destaque</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input v-model="form.ativo" type="checkbox" class="w-4 h-4 accent-rc-red" />
          <Eye class="w-4 h-4 text-rc-red" />
          <span class="text-sm text-surface-700">Ativo</span>
        </label>
      </div>

      <p v-if="erro" class="flex items-center gap-1.5 text-danger-600 text-sm">
        <CircleX class="w-4 h-4 shrink-0" />{{ erro }}
      </p>

      <div class="flex gap-3 pt-2">
        <button type="submit" class="inline-flex items-center gap-2 bg-rc-red hover:bg-rc-redDark text-white font-bold px-6 py-2.5 rounded-xl transition-colors">
          <Save class="w-4 h-4" />
          {{ editando ? 'Salvar alterações' : 'Adicionar produto' }}
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
import {
  PackagePlus, PackageOpen, Star, Eye, Save, X, CircleX,
  ImageUp, Link, Loader2, Check, Tag,
} from 'lucide-vue-next'
import type { Produto } from '~/composables/useStore'
import { sanitizeInput, detectSuspiciousInput, logSecurityEvent } from '~/composables/useSecurity'

const TIPOS_ACEITOS  = ['image/jpeg', 'image/png', 'image/webp']
const TAMANHO_MAX_MB = 4
const TAMANHO_MAX    = TAMANHO_MAX_MB * 1024 * 1024
const DIMENSAO_MAX   = 800
const QUALIDADE_JPEG = 0.78

const MAGIC: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png':  [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}

const props = defineProps<{ produto?: Produto; tipoInicial?: 'produto' | 'servico' | 'medicamento' }>()
const emit  = defineEmits<{ salvo: [produto: Omit<Produto, 'id'>]; cancelar: [] }>()

const editando    = computed(() => !!props.produto)
const erro        = ref('')
const erroImagem  = ref('')
const modoImagem  = ref<'upload' | 'url'>('upload')
const arrastando  = ref(false)
const processando = ref(false)
const urlInput    = ref('')
const inputFileRef = ref<HTMLInputElement | null>(null)

const form = reactive({
  nome:        props.produto?.nome        ?? '',
  categoria:   props.produto?.categoria   ?? '',
  preco:       props.produto?.preco       ?? 0,
  precoAntigo: props.produto?.precoAntigo ?? undefined as number | undefined,
  descricao:   props.produto?.descricao   ?? '',
  imagem:      props.produto?.imagem      ?? '',
  destaque:    props.produto?.destaque    ?? false,
  ativo:       props.produto?.ativo       ?? true,
  emPromocao:  props.produto?.emPromocao  ?? false,
  tipo:        props.produto?.tipo        ?? props.tipoInicial ?? 'produto' as 'produto' | 'servico' | 'medicamento',
})

if (props.produto?.imagem && !props.produto.imagem.startsWith('data:')) {
  urlInput.value = props.produto.imagem
  modoImagem.value = 'url'
}

async function validarMagicBytes(file: File): Promise<boolean> {
  const bytes = await new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(new Uint8Array(e.target!.result as ArrayBuffer))
    reader.readAsArrayBuffer(file.slice(0, 12))
  })

  const assinatura = MAGIC[file.type]
  if (!assinatura) return false
  return assinatura.every((byte, i) => bytes[i] === byte)
}

function comprimirImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      if (width > DIMENSAO_MAX || height > DIMENSAO_MAX) {
        if (width >= height) {
          height = Math.round((height * DIMENSAO_MAX) / width)
          width  = DIMENSAO_MAX
        } else {
          width  = Math.round((width * DIMENSAO_MAX) / height)
          height = DIMENSAO_MAX
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)

      URL.revokeObjectURL(objectUrl)
      const base64 = canvas.toDataURL('image/jpeg', QUALIDADE_JPEG)
      const sizeKB = Math.round(base64.length * 0.75 / 1024)
      if (sizeKB > 3072) {
        reject(new Error(`Imagem muito grande após compressão (${sizeKB} KB). Use uma imagem menor.`))
        return
      }
      resolve(base64)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Falha ao decodificar imagem'))
    }

    img.src = objectUrl
  })
}

async function processarArquivo(file: File) {
  erroImagem.value = ''

  if (!TIPOS_ACEITOS.includes(file.type)) {
    erroImagem.value = 'Formato não suportado. Use JPG, PNG ou WebP.'
    return
  }

  if (file.size > TAMANHO_MAX) {
    erroImagem.value = `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo: ${TAMANHO_MAX_MB} MB.`
    return
  }

  const magicOk = await validarMagicBytes(file)
  if (!magicOk) {
    logSecurityEvent('ATTACK_DETECTED', `Magic bytes inválidos para arquivo: ${file.name} (${file.type})`)
    erroImagem.value = 'Arquivo inválido. Envie uma imagem real JPG, PNG ou WebP.'
    return
  }

  processando.value = true
  try {
    form.imagem = await comprimirImagem(file)
  } catch {
    erroImagem.value = 'Falha ao processar a imagem. Tente outro arquivo.'
  } finally {
    processando.value = false
  }
}

function handleFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) processarArquivo(file)
}

function handleDrop(event: DragEvent) {
  arrastando.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) processarArquivo(file)
}

function aplicarUrl() {
  erroImagem.value = ''
  const url = urlInput.value.trim()

  if (!url) { form.imagem = ''; return }

  if (!url.startsWith('https://')) {
    erroImagem.value = 'Use apenas URLs HTTPS.'
    return
  }

  if (url.length > 2048) {
    erroImagem.value = 'URL muito longa (máx. 2048 caracteres).'
    return
  }

  const img = new Image()
  const timeout = setTimeout(() => {
    img.src = ''
    erroImagem.value = 'A imagem demorou muito para carregar. Verifique a URL.'
  }, 5000)
  img.onload  = () => { clearTimeout(timeout); form.imagem = url }
  img.onerror = () => { clearTimeout(timeout); erroImagem.value = 'URL inválida ou imagem inacessível.' }
  img.src = url
}

function removerImagem() {
  form.imagem   = ''
  urlInput.value = ''
  erroImagem.value = ''
  if (inputFileRef.value) inputFileRef.value.value = ''
}

function handleSubmit() {
  erro.value = ''

  for (const field of [form.nome, form.categoria, form.descricao]) {
    if (detectSuspiciousInput(field)) {
      logSecurityEvent('ATTACK_DETECTED', `Input suspeito no formulário de produto: "${field.slice(0, 50)}"`)
      erro.value = 'Conteúdo inválido detectado. Revise os campos.'
      return
    }
  }

  if (form.preco < 0) {
    erro.value = 'Preço não pode ser negativo.'
    return
  }

  if (form.imagem && !form.imagem.startsWith('data:image/') && !form.imagem.startsWith('https://')) {
    erro.value = 'Imagem inválida. Envie um arquivo ou use uma URL HTTPS.'
    return
  }

  emit('salvo', {
    nome:        sanitizeInput(form.nome),
    categoria:   sanitizeInput(form.categoria),
    descricao:   sanitizeInput(form.descricao),
    preco:       form.preco,
    precoAntigo: form.precoAntigo || undefined,
    imagem:      form.imagem || undefined,
    destaque:    form.destaque,
    ativo:       form.ativo,
    emPromocao:  form.emPromocao,
    tipo:        form.tipo,
  })
}
</script>

<style scoped>
.input-field {
  @apply w-full border border-surface-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rc-red focus:border-transparent transition;
}
</style>

