<template>
  <header class="bg-cream py-4 shadow-md">
    <div class="max-w-7xl mx-auto flex items-center justify-between px-4">
      <NuxtLink to="/" class="text-5xl font-bold text-midnight flex-none">
        Главная
      </NuxtLink>

      <div class="flex items-center gap-3">
        <!-- Не залогинен -->
        <button
          v-if="!loggedIn"
          class="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
          @click="goToLogin"
        >
          Войти / Регистрация
        </button>

        <!-- Залогинен -->
        <div v-else class="flex items-center gap-2">
          <NuxtLink
            to="/account"
            class="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
          >
            {{ displayName }}
          </NuxtLink>
          <button
            class="px-3 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            @click="logout"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { NuxtLink } from '#components'
import { useCookie } from '#app'
import { useRouter } from 'vue-router'

interface StoredUser {
  username?: string
  fullName?: string
  mail?: string
}

const router = useRouter()
const token = useCookie<string | null>('library-token')
const user = ref<StoredUser | null>(null)

const loggedIn = computed(() => !!token.value && !!user.value)

const displayName = computed(() => {
  return user.value?.fullName || user.value?.username || 'Аккаунт'
})

const readUserFromStorage = () => {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('library-user') : null
  if (raw) {
    try {
      user.value = JSON.parse(raw)
    } catch {
      user.value = null
    }
  } else {
    user.value = null
  }
}

const goToLogin = () => {
  router.push('/login')
}

const logout = () => {
  token.value = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('library-user')
  }
  user.value = null
  router.push('/')
}

onMounted(() => {
  readUserFromStorage()

  window.addEventListener('storage', (event) => {
    if (event.key === 'library-user') {
      user.value = event.newValue ? JSON.parse(event.newValue) : null
    }
  })
})

watch(
  () => token.value,
  () => {
    if (typeof window !== 'undefined') {
      readUserFromStorage()
    }
  }
)
</script>
