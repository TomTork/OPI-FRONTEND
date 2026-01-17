<template>
  <UContainer class="py-8 space-y-8">
    <div v-if="loading">
      <UAlert title="Загрузка книги..." color="primary" variant="soft" />
    </div>

    <div v-else-if="book">
        <div class="flex flex-col lg:flex-row lg:items-start gap-8">
        <!-- Обложка -->
        <div class="w-full lg:w-[260px] shrink-0">
            <div
            class="w-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
            style="aspect-ratio: 2 / 3; max-height: 400px;"
            >
            <img
                v-if="imageUrl"
                :src="imageUrl"
                alt="Обложка книги"
                class="w-full h-full object-contain"
                loading="lazy"
            />
            <span v-else class="text-gray-400 text-sm text-center px-2">
                Нет фото
            </span>
            </div>
        </div>

        <!-- Основная информация -->
        <div class="flex-1 space-y-4">
            <h1 class="text-3xl font-bold text-primary">
            {{ book.name }}
            </h1>

            <p class="text-lg text-gray-200">
            {{ book.author }}
            </p>

            <p class="text-sm text-gray-400">
            {{ book.cense }} · {{ book.count_page }} стр. · ISBN {{ book.ISBN }}
            </p>

            <p class="mt-4 text-gray-100 whitespace-pre-line">
            {{ book.description }}
            </p>

            <p class="mt-4 font-medium">
            В наличии:
            <span :class="book.is_available ? 'text-emerald-400' : 'text-red-400'">
                {{ book.count }}
            </span>
            </p>
        </div>
        </div>


      <!-- Библиотеки, где есть книга -->
      <div v-if="book.libraries && book.libraries.length" class="mt-8">
        <h2 class="text-2xl font-semibold mb-4">
          Где можно взять книгу
        </h2>
        <ul class="space-y-2">
          <li
            v-for="lib in book.libraries"
            :key="lib.documentId || lib.id"
            class="text-gray-100"
          >
            {{ lib.name }}
          </li>
        </ul>
      </div>
    </div>

    <div v-else>
      <UAlert title="Книга не найдена" color="error" variant="soft" />
    </div>
  </UContainer>
</template>


<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBackendApi, type BackendBook } from '../../../composables/useApi'

const route = useRoute()
const api = useBackendApi()

const loading = ref(false)
const book = ref<BackendBook | null>(null)

const API_BASE = 'http://localhost:1337'

const imageUrl = computed(() => {
  const raw = book.value?.photos?.[0]?.url
  if (!raw) return ''
  return raw.startsWith('http') ? raw : `${API_BASE}${raw}`
})

onMounted(async () => {
  const documentId = route.params.documentId as string
  loading.value = true
  try {
    const response = await api<BackendBook>('/book', {
      params: { documentId }
    })
    book.value = response ?? null
  } catch (e) {
    console.error('Book load error', e)
  } finally {
    loading.value = false
  }
})
</script>
