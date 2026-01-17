// composables/useApi.ts
import { useCookie, useRuntimeConfig } from '#app'
import type { FetchOptions } from 'ofetch'

// базовый клиент
export const useBackendApi = () => {
  const token = useCookie<string | null>('library-token')
  const config = useRuntimeConfig()
  const client = $fetch.create({
    baseURL: config.public.apiBase || 'http://localhost:1337/api',
    onRequest({ options }) {
      (options as FetchOptions).headers = (options as FetchOptions).headers || {}
      if (token.value) {
        (options.headers as any).Authorization = `Bearer ${token.value}`
      }
    }
  })

  return client
}

// типы под твой бекенд
export interface BackendBook {
  id: number
  documentId: string
  name: string
  description: string
  count: number
  author: string
  cense: string
  count_page: number
  ISBN: string
  release: string
  is_available: boolean
  photos?: { id: number; documentId: string; url: string }[]
  libraries?: any[]
  rents?: any[]
}

export interface BackendLibrary {
  id: number
  documentId: string
  name: string
  phone_number: string
  address?: { lat: number; lng: number }
  WorkSchedule?: { id: number; open: string; close: string }
  Event?: {
    id: number
    description: string | null
    date: string
    header: string
    preview?: { id: number; documentId: string; url: string }
  }[]
  books?: any[]
  employees?: any[]
}

// КНИГИ
export const useBooksApi = () => {
  const api = useBackendApi()

  return {
    getBooks: async (): Promise<BackendBook[]> => {
      const response = await api<BackendBook[]>('/books', {
        params: {
          'pagination[page]': 1,
          'pagination[pageSize]': 10
        }
      })

      console.log('GET /api/books response:', response)
      return Array.isArray(response) ? response : []
    },

    getBook: async (id: string | number): Promise<BackendBook | null> => {
      const response = await api<BackendBook | BackendBook[]>(`/books/${id}`)
      if (Array.isArray(response)) return response[0] ?? null
      return response ?? null
    }
  }
}

// БИБЛИОТЕКИ
export const useLibrariesApi = () => {
  const api = useBackendApi()

  return {
    getLibraries: async (): Promise<BackendLibrary[]> => {
      const response = await api<BackendLibrary[]>('/libraries', {
        params: {
          populate: ['Event', 'WorkSchedule', 'books', 'employees']
        }
      })

      console.log('GET /api/libraries response:', response)
      return Array.isArray(response) ? response : []
    },

    getLibrary: async (id: string | number): Promise<BackendLibrary | null> => {
      const response = await api<BackendLibrary | BackendLibrary[]>(`/libraries/${id}`, {
        params: {
          populate: ['Event', 'WorkSchedule', 'books', 'employees']
        }
      })
      if (Array.isArray(response)) return response[0] ?? null
      return response ?? null
    }
  }
}

// АВТОРИЗАЦИЯ
export const useAuthApi = () => {
  const api = useBackendApi() // baseURL: http://localhost:1337/api

  return {
    login: async (login: string, password: string) => {
      try {
        // GET /api/client/token?login=&password=
        const token = await api<string | null>('/client/token', {
          params: { login, password },
        })
        return token
      } catch {
        return null
      }
    },

    register: async (data: any) =>
      // POST /api/client/register
      api<string | null>('/client/register', {
        method: 'POST',
        body: data,
      }),

    changePassword: async (password: string, token: string) =>
      // POST /api/client/password?password=&token=
      api<string | null>('/client/password', {
        method: 'POST',
        params: { password, token },
      }),
  }
}

