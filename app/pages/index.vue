<template>
  <UContainer class="space-y-10 py-6">
    <!-- популярные книги -->
    <section>
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-3xl font-bold text-primary">
                Популярные книги
            </h2>
        </div>

        <div v-if="booksLoading" class="py-4">
            <UAlert title="Загрузка книг..." color="primary" variant="soft" />
        </div>

        <div
        v-else
        class="flex flex-wrap pb-12 justify-center sm:justify-start"
        style="gap: 2.5rem;"
        >
        <BookCard
            v-for="book in popularBooks"
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


    </section>


    <!-- выбор книги -->
    <section class="flex items-center justify-between">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold">
          Подбор книги
        </h2>
        <p class="text-sm text-gray-500">
          Перейдите в подборщик, чтобы отфильтровать книги по параметрам.
        </p>
      </div>
      <UButton color="primary" size="lg" @click="goToFilter">
        Выбрать книгу
      </UButton>
    </section>

    <!-- график мероприятий -->
    <section>
    <h2 class="text-3xl font-bold mb-4 text-primary">
        Мероприятия
    </h2>
    <div class="flex flex-wrap gap-6 justify-center sm:justify-start">
        <EventTable :libraries="libraries" />
    </div>
    </section>


    <!-- карта филиалов -->
    <section>
      <h2 class="text-3xl font-bold mb-4 text-primary">
        Филиалы в СПБ
      </h2>
      <ClientOnly>
        <UCard>
          <div
            id="map"
            class="mx-auto rounded-lg"
            style="width: 100%; height: 28rem !important;"
          />
        </UCard>
      </ClientOnly>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EventTable from '~/components/EventTable.vue'
import { useBooksApi, useLibrariesApi, type BackendBook, type BackendLibrary } from '../../composables/useApi'

const router = useRouter()
const booksApi = useBooksApi()
const librariesApi = useLibrariesApi()
const booksLoading = ref(false)
const libsLoading = ref(false)
const popularBooks = ref<BackendBook[]>([])
const libraries = ref<BackendLibrary[]>([])

const API_BASE = 'http://localhost:1337'

function getBookImage (book: BackendBook): string {
  const raw = book.photos?.[0]?.url
  if (!raw) return ''
  return raw.startsWith('http') ? raw : `${API_BASE}${raw}`
}

function goToFilter () {
  router.push('/filter')
}

onMounted(async () => {
  booksLoading.value = true
  const allBooks = await booksApi.getBooks()
  popularBooks.value = allBooks.slice(0, 5)
  booksLoading.value = false

  libsLoading.value = true
  libraries.value = await librariesApi.getLibraries()
  libsLoading.value = false

  const L = await import('leaflet')
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow
  })
  const map = L.map('map').setView([59.93, 30.33], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  libraries.value.forEach((lib: any) => {
    if (!lib.address) return
    const { lat, lng } = lib.address
    const marker = L.marker([lat, lng]).addTo(map)
    const schedule = lib.WorkSchedule
      ? `Пн–Пт: ${scheduleTime(lib.WorkSchedule.open)}–${scheduleTime(lib.WorkSchedule.close)}`
      : 'График не указан'
    marker.bindPopup(`<strong>${lib.name}</strong><br>${schedule}`)
    marker.on('mouseover', () => marker.openPopup())
    marker.on('mouseout', () => marker.closePopup())
  })
})

function scheduleTime (t: string | null | undefined) {
  return t ? t.slice(0, 5) : '--:--'
}

function openBook (book: BackendBook) {
  router.push({ path: `/books/${book.documentId}` })
}
</script>
