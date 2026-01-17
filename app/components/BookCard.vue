<template>
  <div
    :class="[
      'card max-w-[280px] w-full flex flex-col gap-2',
      { 'opacity-50': !available }
    ]"
  >
    <!-- КОНТЕЙНЕР С ПРОПОРЦИЯМИ 2:3 (стандарт обложки книги) -->
    <div class="w-full aspect-2/3 bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center p-2">
      <img
        v-if="image"
        :src="image"
        alt="Обложка книги"
        style="
          max-width: 100%; 
          max-height: 100%; 
          width: auto; 
          height: auto; 
          object-fit: contain; 
          display: block;
        "
        loading="lazy"
      />
      <span v-else class="text-gray-400 text-sm px-2 text-center">
        Нет фото
      </span>
    </div>
    
    <div class="title">{{ title }}</div>
    <div class="author">{{ author }}</div>
    <div class="availability">
      {{ available ? `В наличии: ${count}` : 'Нет в наличии' }}
    </div>
  </div>
</template>




<script setup lang="ts">
interface BookCardProps {
  title: string
  author: string
  image?: string
  count?: number
  available?: boolean
}

defineProps<BookCardProps>()
</script>
