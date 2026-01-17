export interface StrapiBook {
  id: number
  attributes: {
    name: string
    author: string
    release: string | null
    description: string | null
    ISBN: string | null
    count: number | null
    count_page: number
    cense: string
    photos: { data: { attributes: { url: string } }[] } | null
    libraries: { data: StrapiLibrary[] } | null
    rents: { data: StrapiRent[] } | null
    publishedAt: string | null
    createdAt: string
    updatedAt: string
  }
}

export interface StrapiClient {
  id: number
  attributes: {
    username: string | null
    mail: string | null
    phone_number: string | null
    is_admin: boolean
    hash_password: string
    token: string | null
    library: { data: StrapiLibrary | null } | null
    rent: { data: StrapiRent | null } | null
    publishedAt: string | null
    createdAt: string
    updatedAt: string
  }
}

export interface StrapiLibrary {
  id: number
  attributes: {
    name: string
    phone_number: string | null
    address: any // geojson
    books: { data: StrapiBook[] } | null
    employees: { data: StrapiClient[] } | null
    Event: any[] // component
    WorkSchedule: any // component
    publishedAt: string | null
    createdAt: string
    updatedAt: string
  }
}

export interface StrapiPage {
  id: number
  attributes: {
    code: string
    description: string
    publishedAt: string | null
    createdAt: string
    updatedAt: string
  }
}

export interface StrapiRent {
  id: number
  attributes: {
    start: string
    end: string
    mark: string | null
    books: { data: StrapiBook[] } | null
    client: { data: StrapiClient | null } | null
    publishedAt: string | null
    createdAt: string
    updatedAt: string
  }
}