<template>
  <!-- список мероприятий -->
  <div v-if="events.length" class="flex flex-wrap gap-6">
    <div
      v-for="event in events"
      :key="event.id"
      class="card max-w-[420px] w-full flex flex-col gap-4"
    >
      <!-- верхняя часть: фото + заголовок + дата + библиотека -->
      <div class="flex gap-4 items-start">
        <!-- ФОТО -->
        <div class="shrink-0">
          <div
            style="
              width: 112px;
              height: 128px;
              background-color: #f3f4f6;
              border-radius: 0.75rem;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <img
              v-if="getEventImage(event)"
              :src="getEventImage(event)"
              alt="Фото мероприятия"
              style="width: 100%; height: 100%; object-fit: cover; display: block;"
              loading="lazy"
            />
            <UIcon
              v-else
              name="i-heroicons-calendar"
              class="w-10 h-10 text-gray-400"
            />
          </div>
        </div>

        <!-- ТЕКСТ справа от фото -->
        <div class="flex-1 min-w-0 flex flex-col gap-2">
          <div class="flex justify-between items-start gap-2">
            <h3 class="title text-base leading-tight line-clamp-2">
              {{ event.title }}
            </h3>
            <span
              class="availability text-xs font-medium bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full shrink-0"
            >
              {{ formatDate(event.date) }}
            </span>
          </div>
          <div class="author text-sm">
            {{ event.library.name }}
          </div>
        </div>
      </div>

      <!-- ОПИСАНИЕ ниже -->
      <div class="text-sm text-gray-600 line-clamp-3">
        {{ event.description }}
      </div>
    </div>
  </div>

  <!-- пустое состояние -->
  <div v-else class="text-center py-12">
    <UIcon name="i-heroicons-calendar" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <p class="text-gray-500 text-lg">Мероприятий пока нет</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  libraries: any[]
}

const props = defineProps<Props>()

const API_BASE = 'http://localhost:1337'

// Собираем мероприятия из библиотек
const events = computed(() => {
  const allEvents: any[] = []

  props.libraries.forEach((library) => {
    const libraryEvents = library.Event || library.events || []

    libraryEvents.forEach((event: any) => {
      allEvents.push({
        id: event.id,
        title: event.header || event.title || event.name,
        date: event.date || event.time,
        description: event.description || '',
        preview: event.preview,
        library
      })
    })
  })

  return allEvents
    .filter(event => event.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)
})

// Фото мероприятия из поля preview (Strapi media)
function getEventImage (event: any): string {
  const raw =
    event.preview?.url ||
    event.preview?.data?.attributes?.url ||
    event.preview?.data?.[0]?.attributes?.url ||
    event.preview?.data?.[0]?.url

  if (!raw) return ''
  if (raw.startsWith('http')) return raw
  return `${API_BASE}${raw}`
}

// Формат даты
function formatDate (dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return `Сегодня ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
  }

  const tomorrow = new Date(now.getTime() + 86400000)
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Завтра ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    }) +
    ` ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`
  )
}
</script>
