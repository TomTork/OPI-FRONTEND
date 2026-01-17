<template>
  <div class="max-w-6xl mx-auto p-6 space-y-8">
    <!-- Блок аккаунта -->
    <div class="bg-[#2a2f48] p-6 rounded-lg shadow-md w-full">
      <!-- Вкладки -->
      <div class="flex border-b border-gray-600 mb-6">
        <button
          class="px-4 py-2 font-semibold -mb-px border-b-2"
          :class="activeTab === 'info' ? 'border-accent text-accent' : 'border-transparent text-gray-400'"
          @click="activeTab = 'info'"
        >
          Данные аккаунта
        </button>
        <button
          class="px-4 py-2 font-semibold -mb-px border-b-2"
          :class="activeTab === 'password' ? 'border-accent text-accent' : 'border-transparent text-gray-400'"
          @click="activeTab = 'password'"
        >
          Смена пароля
        </button>
      </div>

      <transition name="fade" mode="out-in">
        <div :key="activeTab" class="w-full min-h-[250px] grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Информация о пользователе -->
          <template v-if="activeTab === 'info'">
            <div class="account-card">
              <h4 class="font-semibold mb-1 text-primary">Имя пользователя</h4>
              <p>{{ user?.username || '-' }}</p>
            </div>
            <div class="account-card">
              <h4 class="font-semibold mb-1 text-primary">Email</h4>
              <p>{{ user?.mail || '-' }}</p>
            </div>
            <div class="account-card">
              <h4 class="font-semibold mb-1 text-primary">Телефон</h4>
              <p>{{ user?.phone_number || '-' }}</p>
            </div>
            <div class="account-card md:col-span-2">
              <h4 class="font-semibold mb-1 text-primary">Роль</h4>
              <p>{{ isAdmin ? 'Библиотекарь' : 'Читатель' }}</p>
            </div>
          </template>

          <!-- Смена пароля -->
          <template v-else>
            <div class="password-form col-span-1 md:col-span-2 space-y-4 mx-auto">
              <div class="flex flex-col space-y-1">
                <label class="font-medium text-primary">Текущий пароль</label>
                <input type="password" v-model="password.current" class="input-field" />
              </div>
              <div class="flex flex-col space-y-1">
                <label class="font-medium text-primary">Новый пароль</label>
                <input type="password" v-model="password.new" class="input-field" />
              </div>
              <div class="flex flex-col space-y-1">
                <label class="font-medium text-primary">Повторить новый пароль</label>
                <input type="password" v-model="password.repeat" class="input-field" />
              </div>
              <div class="flex justify-center mt-2">
                <button class="bg-accent text-white px-6 py-2 rounded-md" @click="onChangePassword">
                  Сохранить
                </button>
              </div>
              <p v-if="passwordError" class="text-red-400 text-sm text-center">
                {{ passwordError }}
              </p>
              <p v-if="passwordSuccess" class="text-emerald-400 text-sm text-center">
                Пароль успешно изменён
              </p>
            </div>
          </template>
        </div>
      </transition>
    </div>

    <!-- Читатель: его аренды -->
    <div v-if="!isAdmin" class="space-y-6">
      <div class="overflow-x-auto">
        <h2 class="text-xl font-bold mb-4 text-center">Взятые книги</h2>
        <table class="w-full border-collapse border border-gray-600 rounded-md">
          <thead class="bg-[#1f243d]">
            <tr>
              <th class="border border-gray-600 px-4 py-2 text-left">Название</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Дата взятия</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Срок возврата</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Филиал</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Режим работы</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="book in borrowedBooks"
              :key="book.id"
              :class="{
                'bg-red-700/40': isOverdue(book),
                'bg-yellow-700/30': isSoonOverdue(book)
              }"
            >
              <td class="border border-gray-600 px-4 py-2">{{ book.title }}</td>
              <td class="border border-gray-600 px-4 py-2">{{ book.borrowedAt }}</td>
              <td class="border border-gray-600 px-4 py-2">{{ book.dueDate }}</td>
              <td class="border border-gray-600 px-4 py-2">{{ book.branch }}</td>
              <td class="border border-gray-600 px-4 py-2">
                <span v-if="book.librarySchedule">{{ book.librarySchedule }}</span>
                <span v-else>-</span>
              </td>
            </tr>
            <tr v-if="!borrowedBooks.length && !loadingRents">
              <td colspan="5" class="border border-gray-600 px-4 py-4 text-center text-gray-400">
                У вас нет активных аренд
              </td>
            </tr>
            <tr v-if="loadingRents">
              <td colspan="5" class="border border-gray-600 px-4 py-4 text-center text-gray-400">
                Загрузка аренд...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Кабинет библиотекаря -->
    <div v-else class="space-y-6">
      <!-- Вкладки библиотекаря -->
      <div class="flex border-b border-gray-600 mb-6">
        <button
          class="px-4 py-2 font-semibold -mb-px border-b-2"
          :class="librarianTab === 'debtors' ? 'border-accent text-accent' : 'border-transparent text-gray-400'"
          @click="librarianTab = 'debtors'"
        >
          Должники
        </button>
        <button
          class="px-4 py-2 font-semibold -mb-px border-b-2"
          :class="librarianTab === 'issue' ? 'border-accent text-accent' : 'border-transparent text-gray-400'"
          @click="librarianTab = 'issue'"
        >
          Выдача книги
        </button>
        <button
          class="px-4 py-2 font-semibold -mb-px border-b-2"
          :class="librarianTab === 'return' ? 'border-accent text-accent' : 'border-transparent text-gray-400'"
          @click="librarianTab = 'return'"
        >
          Быстрый возврат
        </button>
      </div>

      <!-- Должники -->
      <div v-if="librarianTab === 'debtors'" class="overflow-x-auto">
        <h2 class="text-xl font-bold mb-4 text-center">Должники библиотеки</h2>
        <table class="w-full border-collapse border border-gray-600 rounded-md">
          <thead class="bg-[#1f243d]">
            <tr>
              <th class="border border-gray-600 px-4 py-2 text-left">Читатель</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Телефон</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Email</th>
              <th class="border border-gray-600 px-4 py-2 text-left">Ближайший срок возврата</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="debtor in debtors"
              :key="debtor.id"
              :class="{
                'bg-red-700/40 cursor-pointer hover:bg-red-700/60': debtor.hasOverdue,
                'bg-yellow-700/30 cursor-pointer hover:bg-yellow-700/50': !debtor.hasOverdue && debtor.hasSoonOverdue
              }"
              @click="selectDebtor(debtor)"
            >
              <td class="border border-gray-600 px-4 py-2">{{ debtor.name }}</td>
              <td class="border border-gray-600 px-4 py-2">{{ debtor.phone || '-' }}</td>
              <td class="border border-gray-600 px-4 py-2">{{ debtor.email || '-' }}</td>
              <td class="border border-gray-600 px-4 py-2">{{ debtor.closestDueDate }}</td>
            </tr>
            <tr v-if="!debtors.length && !loadingRents">
              <td colspan="4" class="border border-gray-600 px-4 py-4 text-center text-gray-400">
                Должников нет
              </td>
            </tr>
            <tr v-if="loadingRents">
              <td colspan="4" class="border border-gray-600 px-4 py-4 text-center text-gray-400">
                Загрузка аренд...
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Выдача -->
      <div v-if="librarianTab === 'issue'" class="bg-[#2a2f48] p-6 rounded-lg shadow-md space-y-4">
        <h3 class="text-lg font-semibold mb-4">Оформить выдачу книги</h3>

        <!-- Поиск читателя-->
        <div class="flex flex-col space-y-1 mb-4 relative autocomplete-wrapper">
          <label class="font-medium text-primary">Читатель</label>
          <input
            v-model="readerSearch"
            @input="onReaderInput"
            @focus="showReaderDropdown = true"
            @keydown.down.prevent="moveReaderHighlight(1)"
            @keydown.up.prevent="moveReaderHighlight(-1)"
            @keydown.enter.prevent="chooseHighlightedReader"
            placeholder="Начните вводить имя, телефон или email..."
            class="input-field w-full"
            autocomplete="off"
          />

            <div
              v-if="showReaderDropdown && filteredReaders.length"
              class="mt-1 w-full bg-[#2a2f48] border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
            >
            <div
              v-for="(reader, index) in filteredReaders"
              :key="reader.id"
              class="px-3 py-2 cursor-pointer flex flex-col text-sm border-b border-gray-700 last:border-b-0"
              :class="index === highlightedReaderIndex ? 'bg-accent/30' : 'hover:bg-accent/20'"
              @mousedown.prevent="selectReader(reader)"
            >
              <span class="font-semibold">
                {{ reader.username || reader.name || 'Читатель' }}
              </span>
              <span class="text-xs text-gray-300">
                {{ reader.phone_number || '—' }} • {{ reader.mail || '—' }}
              </span>
            </div>
          </div>

          <div
            v-if="selectedReader"
            class="mt-2 p-3 bg-emerald-500/20 rounded-md text-sm flex items-center justify-between"
          >
            <div>
              {{ selectedReader.username || selectedReader.name }}
              <span class="text-gray-400">
                ({{ selectedReader.phone_number || selectedReader.mail || '—' }})
              </span>
            </div>
            <button @click="clearSelectedReader" class="text-red-400 hover:text-red-300">✕</button>
          </div>
        </div>

        <!-- Поиск книг (автокомплит) -->
        <div class="flex flex-col space-y-1 mb-4 relative autocomplete-wrapper">
          <label class="font-medium text-primary">Книги</label>
          <input
            v-model="bookSearch"
            @input="onBookInput"
            @focus="showBookDropdown = true"
            @keydown.down.prevent="moveBookHighlight(1)"
            @keydown.up.prevent="moveBookHighlight(-1)"
            @keydown.enter.prevent="chooseHighlightedBook"
            placeholder="Начните вводить код или название..."
            class="input-field w-full"
            autocomplete="off"
          />

            <div
              v-if="showBookDropdown && searchBooks.length"
              class="mt-1 w-full bg-[#2a2f48] border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
            >

            <div
              v-for="(book, index) in searchBooks"
              :key="book.id"
              class="px-3 py-2 cursor-pointer flex flex-col text-sm border-b border-gray-700 last:border-b-0"
              :class="index === highlightedBookIndex ? 'bg-accent/30' : 'hover:bg-accent/20'"
              @mousedown.prevent="selectBook(book)"
            >
              <span class="font-semibold">
                {{ book.code }} — {{ book.title }}
              </span>
            </div>
          </div>

          <div v-if="selectedBooks.length" class="mt-3 space-y-2">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="book in selectedBooks"
                :key="book.id"
                class="bg-accent/20 px-3 py-2 rounded-md text-sm flex items-center gap-2"
              >
                {{ book.code }} - {{ book.title }}
                <button @click="removeBook(book.id)" class="text-red-400 hover:text-red-300">✕</button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col space-y-1">
            <label class="font-medium text-primary">Срок (дней)</label>
            <input v-model.number="issueDays" type="number" min="1" max="90" class="input-field" />
          </div>
          <div class="flex flex-col space-y-1">
            <label class="font-medium text-primary">Заметка</label>
            <input v-model="issueNote" type="text" class="input-field" />
          </div>
        </div>

        <button
          :disabled="!selectedReader || !selectedBooks.length"
          class="bg-accent text-white px-8 py-3 rounded-md font-semibold w-full disabled:opacity-50 disabled:cursor-not-allowed"
          @click="onIssueBook"
        >
          Оформить выдачу ({{ selectedBooks.length }} книг)
        </button>

        <p v-if="issueError" class="text-red-400 text-sm text-center">{{ issueError }}</p>
        <p v-if="issueSuccess" class="text-emerald-400 text-sm text-center">Выдача успешно оформлена</p>
      </div>

      <!-- Быстрый возврат -->
      <div v-if="librarianTab === 'return'" class="bg-[#2a2f48] p-6 rounded-lg shadow-md space-y-4">
        <h3 class="text-lg font-semibold mb-4">Быстрый возврат по ID аренды</h3>
        <div class="flex flex-col space-y-1">
          <label class="font-medium text-primary">ID аренды (documentId)</label>
          <input v-model="returnRentId" type="text" placeholder="rib58fko2qng7psg6340s35q" class="input-field" />
        </div>
        <button
          class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md font-semibold w-full"
          :disabled="!returnRentId"
          @click="quickReturn"
        >
          Вернуть аренду
        </button>
        <p v-if="returnSuccess" class="text-emerald-400 text-sm text-center">Аренда успешно возвращена</p>
        <p v-if="returnError" class="text-red-400 text-sm text-center">{{ returnError }}</p>
      </div>

      <!-- Подробности по выбранному должнику -->
      <div v-if="selectedDebtor" class="bg-[#2a2f48] p-6 rounded-lg shadow-md">
        <h3 class="text-lg font-semibold mb-2">Карточка читателя</h3>
        <p><span class="font-medium">ФИО:</span> {{ selectedDebtor.name }}</p>
        <p><span class="font-medium">Телефон:</span> {{ selectedDebtor.phone || '-' }}</p>
        <p><span class="font-medium">Email:</span> {{ selectedDebtor.email || '-' }}</p>

        <h4 class="text-md font-semibold mt-4 mb-2">Взятые книги</h4>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-600 rounded-md">
            <thead class="bg-[#1f243d]">
              <tr>
                <th class="border border-gray-600 px-4 py-2 text-left">Название</th>
                <th class="border border-gray-600 px-4 py-2 text-left">Дата взятия</th>
                <th class="border border-gray-600 px-4 py-2 text-left">Срок возврата</th>
                <th class="border border-gray-600 px-4 py-2 text-left">Статус</th>
                <th class="border border-gray-600 px-4 py-2 text-left">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="rent in selectedDebtor.rents"
                :key="rent.id"
                :class="{
                  'bg-red-700/40': isRentOverdue(rent),
                  'bg-yellow-700/30': isRentSoonOverdue(rent)
                }"
              >
                <td class="border border-gray-600 px-4 py-2">{{ rent.bookTitle }}</td>
                <td class="border border-gray-600 px-4 py-2">{{ rent.startDate }}</td>
                <td class="border border-gray-600 px-4 py-2">{{ rent.dueDate }}</td>
                <td class="border border-gray-600 px-4 py-2">
                  {{ isRentOverdue(rent) ? 'Просрочено' : 'В срок' }}
                </td>
                <td class="border border-gray-600 px-4 py-2">
                  <button
                    class="bg-accent text-white px-3 py-1 rounded-md text-sm"
                    @click="returnBook(rent)"
                  >
                    Оформить возврат
                  </button>
                </td>
              </tr>
              <tr v-if="!selectedDebtor.rents.length">
                <td colspan="5" class="border border-gray-600 px-4 py-4 text-center text-gray-400">
                  Активных аренд нет
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, computed } from 'vue'
import { useBackendApi, useAuthApi } from '../../composables/useApi'
import { useCookie } from '#app'
import { generateHash } from '../utils/hash'

interface ClientUser {
  username?: string
  mail?: string
  email?: string
  phone_number?: string
  is_admin?: boolean
  password_hash?: string
  library?: { name: string; documentId?: string; schedule?: string }
}

interface BorrowedBook {
  id: string | number
  title: string
  borrowedAt: string
  dueDate: string
  branch: string
  librarySchedule?: string
}

interface DebtorRent {
  id: string | number
  bookTitle: string
  startDate: string
  dueDate: string
}

interface DebtorRow {
  id: string | number
  name: string
  phone?: string
  email?: string
  closestDueDate: string
  hasOverdue: boolean
  hasSoonOverdue: boolean
  rents: DebtorRent[]
}

const api = useBackendApi()
const authApi = useAuthApi()
const tokenCookie = useCookie<string | null>('library-token')

const activeTab = ref<'info' | 'password'>('info')
const user = ref<ClientUser | null>(null)
const isAdmin = ref(false)

const password = ref({
  current: '',
  new: '',
  repeat: ''
})
const passwordError = ref('')
const passwordSuccess = ref(false)

const borrowedBooks = ref<BorrowedBook[]>([])
const debtors = ref<DebtorRow[]>([])
const selectedDebtor = ref<DebtorRow | null>(null)

const loadingRents = ref(false)

// Библиотекарь: вкладки и формы
const librarianTab = ref<'debtors' | 'issue' | 'return'>('debtors')
const readerSearch = ref('')
const searchReaders = ref<any[]>([])
const selectedReader = ref<any>(null)
const bookSearch = ref('')
const searchBooks = ref<any[]>([])
const selectedBooks = ref<any[]>([])
const issueDays = ref(14)
const issueNote = ref('')
const issueError = ref('')
const issueSuccess = ref(false)
const returnRentId = ref('')
const returnError = ref('')
const returnSuccess = ref(false)
let searchTimeout: number | null = null

const showReaderDropdown = ref(false)
const highlightedReaderIndex = ref(-1)
const filteredReaders = computed(() => searchReaders.value)

const showBookDropdown = ref(false)
const highlightedBookIndex = ref(-1)

onMounted(async () => {
  console.log('ACCOUNT onMounted')
  try {
    const stored = localStorage.getItem('library-user')
    if (stored) {
      user.value = JSON.parse(stored)
      isAdmin.value = !!user.value?.is_admin
    }

    if (!tokenCookie.value) return

    loadingRents.value = true

    if (!isAdmin.value) {
      await loadClientRents()
    } else {
      await loadLibrarianRents()
    }
  } catch (e) {
    console.error('Load user/rents error', e)
  } finally {
    loadingRents.value = false
  }
})

const searchReadersByQuery = async (query: string) => {
  if (query.length < 2) {
    searchReaders.value = []
    return
  }
  try {
    const resp: any = await api('/clients', {
      params: { query, limit: 20 }
    })

    const clients: any[] = Array.isArray(resp) ? resp : resp?.data || []
    searchReaders.value = clients
  } catch (e) {
    console.error('Search readers error', e)
    searchReaders.value = []
  }
}


type AnyRecord = Record<string, unknown>
const isRecord = (v: unknown): v is AnyRecord => typeof v === 'object' && v !== null

const searchBooksByQuery = async (query: string) => {
  console.log('searchBooksByQuery CALLED with:', query)
  if (query.length < 2) {
    searchBooks.value = []
    return
  }

  try {
    console.log('searchBooksByQuery called with:', query)

    const resp: any = await api('/books', {
      params: {
        q: query,
      },
    })

    console.log('RAW /books resp =', resp)

    const books: any[] = Array.isArray(resp) ? resp : resp?.data || []
    console.log('books array =', books)

    searchBooks.value = books.map((book: any) => ({
      id: book.documentId || book.id,
      code: book.ISBN || book.cense || book.documentId || '',
      title: book.name || 'Книга',
    }))

    console.log('searchBooks =', searchBooks.value)
  } catch (e) {
    console.error('Search books error', e)
    searchBooks.value = []
  }
}


const debounce = (fn: Function, ms = 400) => {
  return (...args: any[]) => {
    if (searchTimeout) clearTimeout(searchTimeout as unknown as number)
    searchTimeout = window.setTimeout(() => fn(...args), ms)
  }
}

const debounceSearchReaders = debounce(() => searchReadersByQuery(readerSearch.value), 300)
const debounceSearchBooks = debounce(() => searchBooksByQuery(bookSearch.value), 300)

// Читатели: обработчики автокомплита
const onReaderInput = () => {
  console.log('onReaderInput, value =', readerSearch.value)
  showReaderDropdown.value = true
  highlightedReaderIndex.value = -1
  debounceSearchReaders()
}

const selectReader = (reader: any) => {
  selectedReader.value = reader
  readerSearch.value =
    reader.username || reader.name || reader.mail || reader.phone_number || ''
  showReaderDropdown.value = false
}

const clearSelectedReader = () => {
  selectedReader.value = null
  readerSearch.value = ''
}

const moveReaderHighlight = (direction: 1 | -1) => {
  if (!filteredReaders.value.length) return
  if (highlightedReaderIndex.value === -1) {
    highlightedReaderIndex.value = direction === 1 ? 0 : filteredReaders.value.length - 1
    return
  }
  const next = highlightedReaderIndex.value + direction
  if (next < 0) highlightedReaderIndex.value = filteredReaders.value.length - 1
  else if (next >= filteredReaders.value.length) highlightedReaderIndex.value = 0
  else highlightedReaderIndex.value = next
}

const chooseHighlightedReader = () => {
  if (
    highlightedReaderIndex.value < 0 ||
    highlightedReaderIndex.value >= filteredReaders.value.length
  ) return
  selectReader(filteredReaders.value[highlightedReaderIndex.value])
}

// Книги: обработчики автокомплита
const onBookInput = () => {
  console.log('onBookInput BOOK, value =', bookSearch.value)
  showBookDropdown.value = true
  highlightedBookIndex.value = -1
  debounceSearchBooks()
}

const selectBook = (book: any) => {
  if (!selectedBooks.value.some((b: any) => b.id === book.id)) {
    selectedBooks.value.push(book)
  }
  bookSearch.value = ''
  showBookDropdown.value = false
}

const moveBookHighlight = (direction: 1 | -1) => {
  if (!searchBooks.value.length) return
  if (highlightedBookIndex.value === -1) {
    highlightedBookIndex.value = direction === 1 ? 0 : searchBooks.value.length - 1
    return
  }
  const next = highlightedBookIndex.value + direction
  if (next < 0) highlightedBookIndex.value = searchBooks.value.length - 1
  else if (next >= searchBooks.value.length) highlightedBookIndex.value = 0
  else highlightedBookIndex.value = next
}

const chooseHighlightedBook = () => {
  if (
    highlightedBookIndex.value < 0 ||
    highlightedBookIndex.value >= searchBooks.value.length
  ) return
  selectBook(searchBooks.value[highlightedBookIndex.value])
}

const addSelectedBook = () => {
  if (!bookSearch.value) return
  const matched = searchBooks.value.find((b: any) => b.code === bookSearch.value)
  if (matched && !selectedBooks.value.some((b: any) => b.id === matched.id)) {
    selectedBooks.value.push(matched)
    bookSearch.value = ''
    searchBooks.value = []
  }
}

const removeBook = (bookId: string) => {
  selectedBooks.value = selectedBooks.value.filter((b: any) => b.id !== bookId)
}

const loadClientRents = async () => {
  const rentsResponse: any = await api('/rents', {
    params: { token: tokenCookie.value }
  })
  const rents = Array.isArray(rentsResponse) ? rentsResponse : rentsResponse?.data || []
  borrowedBooks.value = rents.map((r: any) => ({
    id: r.documentId || r.id,
    title: r.bookTitle || r.book?.title || 'Книга',
    borrowedAt: r.start,
    dueDate: r.end,
    branch: r.libraryName || r.library?.name || 'Филиал',
    librarySchedule: r.library?.schedule || r.librarySchedule
  }))
}

const loadLibrarianRents = async () => {
  const rentsResponse: any = await api('/rents', {
    params: { token: tokenCookie.value }
  })
  const rents: any[] = Array.isArray(rentsResponse) ? rentsResponse : rentsResponse?.data || []
  const map = new Map<string | number, DebtorRow>()

  rents.forEach((r: any) => {
    const clientId = r.clientId || r.client?.documentId || r.client?.id
    if (!clientId) return

    const name = r.client?.name || r.client?.username || 'Читатель'
    const phone = r.client?.phone_number || r.client?.phone || r.clientPhone
    const email = r.client?.mail || r.client?.email || r.clientEmail

    const rentItem: DebtorRent = {
      id: r.documentId || r.id,
      bookTitle: r.bookTitle || r.book?.title || 'Книга',
      startDate: r.start,
      dueDate: r.end
    }

    if (!map.has(clientId)) {
      map.set(clientId, {
        id: clientId,
        name,
        phone,
        email,
        closestDueDate: r.end,
        hasOverdue: false,
        hasSoonOverdue: false,
        rents: [rentItem]
      })
    } else {
      const row = map.get(clientId)!
      row.rents.push(rentItem)

      const currentClosest = new Date(row.closestDueDate)
      const newDate = new Date(r.end)
      if (newDate.getTime() < currentClosest.getTime()) {
        row.closestDueDate = r.end
      }
    }
  })

  const now = new Date()
  map.forEach((row) => {
    row.hasOverdue = row.rents.some((rent) => new Date(rent.dueDate).getTime() < now.getTime())
    row.hasSoonOverdue = row.rents.some((rent) => {
      const due = new Date(rent.dueDate)
      const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 3 && diffDays >= 0
    })
  })

  debtors.value = Array.from(map.values())
}

const onChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = false

  const { current, new: newPass, repeat } = password.value as any

  if (!current || !newPass || !repeat) {
    passwordError.value = 'Заполните все поля'
    return
  }

  if (newPass !== repeat) {
    passwordError.value = 'Новый пароль и подтверждение не совпадают'
    return
  }

  if (!user.value?.password_hash) {
    passwordError.value = 'Невозможно проверить текущий пароль'
    return
  }

  const currentHash = await generateHash(current)
  const storedHash = String(user.value.password_hash).toLowerCase()

  if (currentHash !== storedHash) {
    passwordError.value = 'Неверный текущий пароль'
    return
  }

  try {
    // ВАЖНО: передаём новый пароль и токен
    const newToken = await authApi.changePassword(newPass, tokenCookie.value as string)

    const newHash = await generateHash(newPass)
    user.value.password_hash = newHash
    localStorage.setItem('library-user', JSON.stringify(user.value))

    if (newToken) {
      tokenCookie.value = newToken
    }

    passwordSuccess.value = true
    password.value.current = ''
    password.value.new = ''
    password.value.repeat = ''
  } catch (e) {
    console.error('Change password error', e)
    passwordError.value = 'Не удалось изменить пароль'
  }
}

const isOverdue = (book: BorrowedBook) => {
  const now = new Date()
  const due = new Date(book.dueDate)
  return due.getTime() < now.getTime()
}

const isSoonOverdue = (book: BorrowedBook) => {
  const now = new Date()
  const due = new Date(book.dueDate)
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3 && diffDays >= 0
}

const isRentOverdue = (rent: DebtorRent) => {
  const now = new Date()
  const due = new Date(rent.dueDate)
  return due.getTime() < now.getTime()
}

const isRentSoonOverdue = (rent: DebtorRent) => {
  const now = new Date()
  const due = new Date(rent.dueDate)
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3 && diffDays >= 0
}

const selectDebtor = (debtor: DebtorRow) => {
  selectedDebtor.value = debtor
}

const returnBook = async (rent: DebtorRent) => {
  if (!tokenCookie.value) return
  try {
    await api('/rent', {
      method: 'DELETE',
      params: {
        documentId: rent.id,
        token: tokenCookie.value
      }
    })
    await loadLibrarianRents()
    if (selectedDebtor.value) {
      const updated = debtors.value.find((d) => d.id === selectedDebtor.value?.id) || null
      selectedDebtor.value = updated
    }
  } catch (e) {
    console.error('Return book error', e)
  }
}

const quickReturn = async () => {
  if (!returnRentId.value) return
  try {
    loadingRents.value = true
    await api('/rent', {
      method: 'DELETE',
      params: { documentId: returnRentId.value, token: tokenCookie.value }
    })
    returnSuccess.value = true
    returnRentId.value = ''
    setTimeout(() => (returnSuccess.value = false), 3000)
    await loadLibrarianRents()
  } catch (e) {
    returnError.value = 'Ошибка возврата'
  } finally {
    loadingRents.value = false
  }
}

const onIssueBook = async () => {
  issueError.value = ''
  issueSuccess.value = false

  if (!selectedReader.value?.id || !selectedBooks.value.length) {
    issueError.value = 'Выберите читателя и минимум 1 книгу'
    return
  }

  try {
    const startDate = new Date().toISOString().split('T')[0]
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + issueDays.value)

    await api('/rent', {
      method: 'POST',
      params: { token: tokenCookie.value },
      body: {
        client: selectedReader.value.id,
        books: selectedBooks.value.map((b: any) => b.id),
        start: startDate,
        end: endDate.toISOString().split('T')[0],
        mark: issueNote.value
      }
    })

    selectedReader.value = null
    selectedBooks.value = []
    readerSearch.value = ''
    issueNote.value = ''
    issueSuccess.value = true
    setTimeout(() => (issueSuccess.value = false), 3000)
    await loadLibrarianRents()
  } catch (e) {
    console.error('Issue book error', e)
    issueError.value = 'Ошибка оформления'
  }
}
</script>

<style scoped>
.account-card {
  background-color: #2a2f48;
  color: #f0e7d5;
  padding: 1rem;
  border-radius: 0.75rem;
}

.password-form {
  max-width: 360px;
  width: 100%;
}

.input-field {
  width: 100%;
  max-width: 300px;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  background-color: #212842;
  color: #f0e7d5;
}

.input-field:focus {
  border-color: #4fd1c5;
  box-shadow: 0 0 0 3px rgba(79, 209, 197, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, height 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

</style>
