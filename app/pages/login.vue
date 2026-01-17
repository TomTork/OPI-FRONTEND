<template>
  <UContainer class="py-8 space-y-8 max-w-xl mx-auto">
    <h1 class="text-3xl font-bold text-primary mb-4">
      Вход в библиотеку
    </h1>

    <!-- Вкладки -->
    <div class="flex border-b border-gray-600 mb-6">
      <button
        class="px-4 py-2 font-semibold -mb-px border-b-2"
        :class="tab === 'login' ? 'border-accent text-accent' : 'border-transparent text-gray-400'"
        @click="tab = 'login'"
      >
        Войти
      </button>
      <button
        class="px-4 py-2 font-semibold -mb-px border-b-2"
        :class="tab === 'register' ? 'border-accent text-accent' : 'border-transparent text-gray-400'"
        @click="tab = 'register'"
      >
        Регистрация
      </button>
    </div>

    <transition name="fade" mode="out-in">
      <!-- Вход -->
      <form
        v-if="tab === 'login'"
        :key="'login'"
        class="space-y-4 bg-[#2a2f48] p-6 rounded-lg shadow-md"
        @submit.prevent="onLogin"
      >
        <div class="flex flex-col items-center space-y-1">
          <label class="font-medium text-primary">Имя пользователя</label>
          <input v-model="loginForm.login" type="text" class="form-input w-full" />
        </div>

        <div class="flex flex-col items-center space-y-1">
          <label class="font-medium text-primary">Пароль</label>
          <input v-model="loginForm.password" type="password" class="form-input w-full" />
        </div>

        <div class="flex flex-col items-center space-y-1">
          <button type="submit" class="bg-accent text-white px-6 py-2 rounded-md">
            Войти
          </button>
        </div>

        <p v-if="loginError" class="text-red-400 text-sm text-center">
          {{ loginError }}
        </p>
      </form>

      <!-- Регистрация -->
      <form
        v-else
        :key="'register'"
        class="space-y-4 bg-[#2a2f48] p-6 rounded-lg shadow-md"
        @submit.prevent="onRegister"
      >
        <div class="flex flex-col items-center space-y-1">
          <label class="font-medium text-primary">Имя пользователя</label>
          <input v-model="registerForm.login" type="text" class="form-input w-full" />
        </div>

        <div class="flex flex-col items-center space-y-1">
          <label class="font-medium text-primary">Email</label>
          <input v-model="registerForm.mail" type="email" class="form-input w-full" />
        </div>

        <div class="flex flex-col items-center space-y-1">
          <label class="font-medium text-primary">Телефон</label>
          <input v-model="registerForm.phone_number" type="tel" class="form-input w-full" />
        </div>

        <div class="flex flex-col items-center space-y-1">
          <label class="font-medium text-primary">Пароль</label>
          <input v-model="registerForm.password" type="password" class="form-input w-full" />
        </div>

        <div class="flex justify-center mt-2">
          <button type="submit" class="bg-accent text-white px-6 py-2 rounded-md">
            Зарегистрироваться
          </button>
        </div>

        <p v-if="registerError" class="text-red-400 text-sm text-center">
          {{ registerError }}
        </p>
        <p v-if="registerSuccess" class="text-emerald-400 text-sm text-center">
          Регистрация успешна, теперь войдите
        </p>
      </form>
    </transition>
  </UContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookie } from '#app'
import { useAuthApi, useBackendApi } from '../../composables/useApi'
import { generateHash } from '../utils/hash'

const router = useRouter()
const authApi = useAuthApi()
const api = useBackendApi()

const tab = ref<'login' | 'register'>('login')

const loginForm = ref({
  login: '',
  password: '',
})
const loginError = ref('')

const registerForm = ref({
  login: '',
  mail: '',
  password: '',
  phone_number: '',
})
const registerError = ref('')
const registerSuccess = ref(false)

const tokenCookie = useCookie<string | null>('library-token')

const onLogin = async () => {
  loginError.value = ''
  if (!loginForm.value.login || !loginForm.value.password) {
    loginError.value = 'Введите логин и пароль'
    return
  }

  const isEmail = /\S+@\S+\.\S+/.test(loginForm.value.login)
  if (isEmail) {
    loginError.value = 'В качестве логина используйте имя пользователя, а не email'
    return
  }

  try {
    // Получаем токен
    const token = await authApi.login(loginForm.value.login, loginForm.value.password)
    if (!token) {
      loginError.value = 'Неверный логин или пароль'
      return
    }

    // Получаем профиль
    const profile: any = await api('/client/info', {
      params: { token }
    })

    // Получаем хэш
    const passwordHash = await generateHash(loginForm.value.password)

    const user = {
      username: loginForm.value.login,
      mail: profile.mail || '',
      phone_number: profile.phone_number || '',
      is_admin: !!profile.is_admin,
      password_hash: passwordHash,
    }

    localStorage.setItem('library-user', JSON.stringify(user))

    localStorage.setItem('library-user', JSON.stringify(user))
    console.log('LOGIN SAVED USER =', user)
    console.log('LOGIN RAW LS =', localStorage.getItem('library-user'))

    tokenCookie.value = token
    console.log('Token saved to cookie:', tokenCookie.value)

    await nextTick()
    await router.push('/account')
  } catch (e) {
    console.error('Login error', e)
    loginError.value = 'Ошибка входа'
  }
}


const onRegister = async () => {
  registerError.value = ''
  registerSuccess.value = false

  const { login, mail, password, phone_number } = registerForm.value
  if (!login || !mail || !password || !phone_number) {
    registerError.value = 'Заполните все поля'
    return
  }

  try {
    await authApi.register({
      login,
      mail,
      password,
      phone_number,
    })

    // Сохраняем данные локально для первого входа
    const user = {
      username: login,
      mail,
      phone_number,
      is_admin: false,
      password_hash: '', // хэш подтянется при первом логине
    }
    localStorage.setItem('library-user', JSON.stringify(user))

    registerSuccess.value = true
    tab.value = 'login'
  } catch (e) {
    console.error('Register error', e)
    registerError.value = 'Не удалось зарегистрироваться'
  }
}
</script>
