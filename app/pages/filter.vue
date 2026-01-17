<template>
  <section>
    <h2 v-if="!compact" class="text-2xl font-bold text-primary mb-4">
      Выбор книги
    </h2>

    <!-- Фильтры -->
    <div class="flex flex-wrap gap-4 mb-6">
      <select
        v-model="filters.author"
        class="border p-2 rounded-md min-w-[150px] hover:border-accent transition-colors"
      >
        <option value="">Автор</option>
        <option v-for="a in authors" :key="a" :value="a">
          {{ a }}
        </option>
      </select>
    </div>

    <!-- Список книг -->
    <div v-if="!compact">
      <div v-if="loading" class="py-4">
        <UAlert title="Загрузка книг..." color="primary" variant="soft" />
      </div>

      <div
        v-else
        class="flex flex-wrap pb-12 justify-center sm:justify-start"
        style="gap: 2.5rem;"
      >
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :title="book.name"
          :author="book.author"
          :image="getBookImage(book)"
          :count="book.count ?? 0"
          :available="(book.count ?? 0) > 0"
          class="cursor-pointer"
          @click="openBook(book)"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookCard from '~/components/BookCard.vue'
import {
  useBooksApi,
  type BackendBook
} from '../../composables/useApi'

const props = defineProps({
  compact: { type: Boolean, default: false }
})

const router = useRouter()
const route = useRoute()
const booksApi = useBooksApi()

const loading = ref(false)
const books = ref<BackendBook[]>([])
const authors = ref<string[]>([])

const filters = reactive({
  author: (route.query.author as string) || ''
})

const API_BASE = 'http://localhost:1337'

function getBookImage (book: BackendBook): string {
  const raw = book.photos?.[0]?.url
  if (!raw) return ''
  return raw.startsWith('http') ? raw : `${API_BASE}${raw}`
}

function applyFilters () {
  router.push({ path: '/filter', query: { author: filters.author || undefined } })
}

const filteredBooks = computed(() => {
  if (!filters.author) return books.value
  return books.value.filter(b => b.author === filters.author)
})

onMounted(async () => {
  loading.value = true
  try {
    const all = await booksApi.getBooks()
    books.value = all
    authors.value = Array.from(
      new Set(all.map(b => b.author).filter(Boolean))
    )
  } catch (e) {
    console.error('Books load error (filter page)', e)
  } finally {
    loading.value = false
  }
})

function openBook (book: BackendBook) {
  router.push({ path: `/books/${book.documentId}` })
}
</script>
