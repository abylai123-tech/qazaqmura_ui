<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch } from 'vue'
import nocover from '@/assets/no-book-cover.svg'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()

interface Book {
  id: number
  volume: number
  part: number
  amount: number
  city_id: number | null
  title: string
  title2: string | null
  ISBN: string
  ISBN2: string | null
  year: number
  pages: number
  quotes: string[] | null
  annotation: string
  book_school: any
  book_author: { id: number; name: string }[]
  book_author_main: { id: number; name: string }[]
  book_category: any[]
  book_cover: any
  book_epub: any
  book_genre: any[]
  book_language: { id: number; title: string }[]
  book_publisher: { id: number; title: string }[]
  book_bbk: any[]
  book_classroom: any
  book_classroom_language: any
  book_type: { id: number; title: string }[]
  book_udk: any[]
  book_copyright_sign: any[]
  book_age_characteristic: any[]
  book_education_level: any[]
  book_country: any[]
}

interface Contractor {
  address: string
  company_ID: string
  id: number
  system: boolean
  title: string
}

interface Publisher {
  id: number
  title: string
}

interface CopyrightSign {
  id: number
  number: string
  title: string
}

interface BookAdmission {
  amount: number
  book_id: number
  book_state_id: number | null
  price: number
  admission_at: string
  contractor_id: number | null
  book_admission_id: number | null
}

interface Author {
  id: number
  name: string
}

const languageId: Ref<number | null> = ref(null),
  authorId: Ref<number | null> = ref(null),
  publisherId: Ref<number | null> = ref(null),
  year: Ref<number | null> = ref(null),
  search: Ref<string | null> = ref(null),
  epub: Ref<boolean | null> = ref(null),
  genreId: Ref<number | null> = ref(null),
  ageCharacteristicId: Ref<number | null> = ref(null),
  countryId: Ref<number | null> = ref(null),
  copyrightSignId: Ref<number | null> = ref(null),
  bookClassroom: Ref<number | null> = ref(null),
  loading: Ref<boolean> = ref(false),
  items: Ref<Book[] | null> = ref(null),
  page: Ref<number> = ref(1),
  length: Ref<number> = ref(0),
  message: Ref<string> = ref(''),
  contractors: Ref<Contractor[]> = ref([]),
  states: Ref<Publisher[]> = ref([]),
  admissions: Ref<Publisher[]> = ref([]),
  languages: Ref<Publisher[]> = ref([]),
  authors: Ref<Author[]> = ref([]),
  publishers: Ref<Publisher[]> = ref([]),
  selectedType: Ref<{ id: number; title: string }> = ref({ id: 0, title: t('book_type') }),
  types: Ref<Publisher[]> = ref([]),
  genres: Ref<Publisher[]> = ref([]),
  ageCharacteristics: Ref<Author[]> = ref([]),
  countries: Ref<Publisher[]> = ref([]),
  copyrightSigns: Ref<CopyrightSign[]> = ref([]),
  admission: Ref<BookAdmission> = ref({
    amount: 0,
    book_id: 0,
    book_state_id: null,
    price: 0,
    admission_at: '',
    contractor_id: null,
    book_admission_id: null
  }),
  drawer: Ref<boolean> = ref(false),
  selectedItem: Ref<Book> = ref({
    id: 0,
    volume: 0,
    part: 0,
    amount: 0,
    city_id: null,
    title: '',
    title2: null,
    ISBN: '',
    ISBN2: null,
    year: 0,
    pages: 0,
    quotes: null,
    annotation: '',
    book_school: null,
    book_author: [],
    book_author_main: [],
    book_category: [],
    book_cover: null,
    book_epub: null,
    book_genre: [],
    book_language: [],
    book_publisher: [],
    book_bbk: [],
    book_classroom: null,
    book_classroom_language: null,
    book_type: [],
    book_udk: [],
    book_copyright_sign: [],
    book_age_characteristic: [],
    book_education_level: [],
    book_country: []
  }),
  tab: Ref<string> = ref('one')

const auth = useAuth()
const booksTotal = ref(0)

async function getBooks() {
  loading.value = true
  try {
    let requestString = `/v1/book?page=${page.value}`
    if (search.value) {
      requestString += `&title=${search.value}`
    }
    if (selectedType.value.id != 0) {
      requestString += `&type_id=${selectedType.value.id}`
    }
    if (languageId.value) {
      requestString += `&language_id=${languageId.value}`
    }
    if (authorId.value) {
      requestString += `&author_id=${authorId.value}`
    }
    if (publisherId.value) {
      requestString += `&publisher_id=${publisherId.value}`
    }
    if (year.value) {
      requestString += `&year=${year.value}`
    }
    if (epub.value) {
      requestString += `&epub=1`
    }
    if (genreId.value) {
      requestString += `&genre_id=${genreId.value}`
    }
    if (ageCharacteristicId.value) {
      requestString += `&age_characteristic_id=${ageCharacteristicId.value}`
    }
    if (countryId.value) {
      requestString += `&country_id=${countryId.value}`
    }
    if (copyrightSignId.value) {
      requestString += `&copyright_sign_id=${copyrightSignId.value}`
    }
    if (bookClassroom.value) {
      requestString += `&book_classroom=${bookClassroom.value}`
    }
    if (local.value) {
      requestString += '&local=1'
    }
    if (sorting.value) {
      requestString += `&sort=${sorting.value}`
    }

    const response = await api.fetchData<{ data: { items: Book[] }; meta: { last_page: number } }>(
      requestString
    )

    if (response.data) {
      items.value = response.data.data.items
      length.value = response.data.meta.last_page
      booksTotal.value = response.data.meta.total
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const downloadEPUB = (epub: { id: number; book_id: number; value: string }) => {
  const link = document.createElement('a')
  link.href = `/storage/epub/${epub.value}`
  link.click()
  document.body.removeChild(link)
}

function resetFilters() {
  search.value = null
  selectedType.value = { id: 0, title: t('book_type') }
  languageId.value = null
  authorId.value = null
  publisherId.value = null
  year.value = null
  epub.value = null
  genreId.value = null
  ageCharacteristicId.value = null
  copyrightSignId.value = null
  countryId.value = null
  bookClassroom.value = null
  getBooks()
}

async function sendRequest(
  bookId: number,
  formMessage: string,
  type: number,
  isActive: Ref<boolean>
) {
  const form = { book_id: bookId, message: formMessage, type: type }
  try {
    await api.postData('/v1/user/request', form)
    isActive.value = false
    message.value = ''
  } catch (error) {
    console.error('Error:', error)
  }
}

function formatDate(dateToFormat: string) {
  const date = new Date(dateToFormat)
  const day = date.getDate().toString().length > 1 ? date.getDate() : '0' + date.getDate()
  const month =
    (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : '0' + date.getMonth()
  return `${day}.${month}.${date.getFullYear()}`
}

async function sendAdmission(admissionForm: BookAdmission, isActive: Ref<boolean>, id: number) {
  const form = { ...admissionForm }
  form.admission_at = formatDate(form.admission_at)
  form.book_id = id
  try {
    await api.postData('/v1/book/school/link', { books: [form] })
    isActive.value = false
    admission.value = {
      amount: 0,
      book_id: 0,
      book_state_id: null,
      price: 0,
      admission_at: '',
      contractor_id: null,
      book_admission_id: null
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

async function getTypes(search = null) {
  try {
    let request = `/v1/type`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) types.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getContractors(search = null) {
  try {
    let request = `/v1/contractor`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Contractor[] } }>(request)
    if (response.data) contractors.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getGenres(search = null) {
  try {
    let request = `/v1/genre`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) genres.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getAgeCharacteristics(search = null) {
  try {
    let request = `/v1/age/characteristic`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) ageCharacteristics.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getStates(search = null) {
  try {
    let request = `/v1/book/state`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) states.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getAdmissions(search = null) {
  try {
    let request = `/v1/book/admission`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) admissions.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getLanguages(search = null) {
  try {
    let request = `/v1/language`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) languages.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getAuthors(search = null) {
  try {
    let request = `/v1/author`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) authors.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getPublishers(search = null) {
  try {
    let request = `/v1/publisher`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) publishers.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getCountries(search = null) {
  try {
    let request = `/v1/country`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) countries.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getCopyrightSigns(search = null) {
  try {
    let request = `/v1/copyright/sign`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: CopyrightSign[] } }>(request)
    if (response.data) copyrightSigns.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const newItem: Ref<{
  name: string
  title: string
  active: boolean
  label: string
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading' | 'contractor' | null
  companyId?: string
  address?: string
}> = ref({
  name: '',
  active: false,
  title: '',
  label: '',
  itemType: null
})

function setNewItem(itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading') {
  if (itemType === 'author') {
    newItem.value.title = 'Добавление автора'
    newItem.value.label = 'Имя автора'
  } else if (itemType === 'publisher') {
    newItem.value.title = 'Добавление издателя'
    newItem.value.label = 'Название издателя'
  } else if (itemType === 'genre') {
    newItem.value.title = 'Добавление жанра'
    newItem.value.label = 'Название жанра'
  } else if (itemType === 'subjectHeading') {
    newItem.value.title = 'Добавление предметной рубрики'
    newItem.value.label = 'Название предметной рубрики'
  } else if (itemType === 'contractor') {
    newItem.value.title = 'Добавление контрагента'
    newItem.value.label = 'Название контрагента'
  }

  newItem.value.name = ''
  newItem.value.itemType = itemType
  newItem.value.active = true
}

async function addNewItem(
  itemType: 'author' | 'publisher' | 'genre' | 'subjectHeading',
  isActive: Ref<boolean>
) {
  const request = itemType === 'subjectHeading' ? 'subject/heading' : itemType
  const requestBody: { name?: string; title?: string } = {}
  if (itemType === 'subjectHeading' || itemType === 'author') {
    requestBody.name = newItem.value.name
  } else {
    requestBody.title = newItem.value.name
  }
  try {
    await api.postData(`/v1/${request}`, requestBody)
  } catch (e) {
    console.error('Error:', e)
  }
  isActive.value = false
}

const sorting: Ref<string | null> = ref(null)
const local: Ref<boolean> = ref(false)

const deleteItem = async (id: number, isActive: Ref<boolean>) => {
  await api.deleteData(`/v1/book/${id}`)
  await getBooks()
  isActive.value = false
}

const getImageURL = (url: string) => {
  return import.meta.env.VITE_APP_API + '/storage/covers/' + url
}



getBooks()
getAdmissions()
getContractors()
getStates()
getLanguages()
getAuthors()
getPublishers()
getTypes()
getGenres()
getAgeCharacteristics()
getCountries()
getCopyrightSigns()

watch(page, () => {
  getBooks()
})
</script>

<template>
  <v-dialog v-model="newItem.active" max-width="500">
    <template v-slot:default="{ isActive }">
      <v-card :title="newItem.title">
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="newItem.name"
              :label="newItem.label"
              variant="outlined"
            ></v-text-field>
            <v-text-field
              v-if="newItem.itemType === 'contractor'"
              v-model="newItem.companyId"
              label="БИН"
              variant="outlined"
            ></v-text-field>
            <v-text-field
              v-if="newItem.itemType === 'contractor'"
              v-model="newItem.address"
              :label="t('address')"
              variant="outlined"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-btn variant="outlined" @click="isActive.value = false">Отмена</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" @click="addNewItem(newItem.itemType, isActive)"
            >{{t('add')}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">M-DATA</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >{{t('database_by_rk')}}</span
          >
        </div>
      </template>

      <template v-slot:append>
        <v-divider class="mr-6" inset vertical></v-divider>
        <div class="mr-4">
          <div>
            <span class="font-weight-bold">{{ booksTotal }}</span>
          </div>
          <div><small class="text-medium-emphasis">Наименования книг</small></div>
        </div>

        <v-switch
          v-model="local"
          class="my-auto mr-3"
          color="primary"
          :label="t('show_added_books')"
        ></v-switch>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn append-icon="mdi-chevron-down" class="mr-6" v-bind="props" variant="tonal"
              >{{t('sorting')}}
            </v-btn>
          </template>

          <v-list>
            <v-list-item @click="sorting = 'a-z'">{{t('sort_a_to_z')}}</v-list-item>
            <v-list-item @click="sorting = 'z-a'">{{t('sort_z_to_a')}}</v-list-item>
            <v-list-item @click="sorting = 'new'">{{t('sort_old_to_new')}}</v-list-item>
            <v-list-item @click="sorting = 'old'">{{t('sort_new_to_old')}}</v-list-item>
          </v-list>
        </v-menu>
        <help-button />
        <v-btn class="ml-3" color="primary" prepend-icon="mdi-plus" to="m-data/add" variant="flat"
          >{{t('add')}}
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary width="700">
      <v-list-item>
        <div class="d-flex justify-space-between align-center">
          <span class="font-weight-bold">Детальная информация о книге</span>
          <v-btn icon="mdi-close" variant="text" @click="drawer = false"></v-btn>
        </div>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-tabs v-model="tab" color="primary">
          <v-tab value="one">О книге</v-tab>
          <v-tab value="two">Информация о состоянии фонда</v-tab>
          <v-tab value="three">В читательском зале</v-tab>
          <v-tab value="four">На выдаче</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="one">
            <v-container fluid>
              <v-row>
                <v-col cols="4">
                  <v-img :src="nocover" class="rounded" fluid></v-img>
                </v-col>
                <v-col cols="8">
                  <v-row>
                    <v-chip
                      v-for="item in selectedItem.book_type"
                      :key="item.id"
                      color="primary"
                      variant="flat"
                    >
                      {{ item.title }}
                    </v-chip>
                  </v-row>
                  <v-row class="mt-4">
                    <div class="font-weight-bold">{{ selectedItem.title }}</div>
                    <div>{{ selectedItem.title2 }}</div>
                  </v-row>
                  <v-row class="mt-4">
                    <v-chip
                      v-for="item in selectedItem.book_author_main"
                      :key="item.id"
                      color="primary"
                      variant="outlined"
                    >
                      {{ item.name }}
                    </v-chip>
                  </v-row>
                  <v-row class="mt-4">
                    <div>{{ selectedItem.annotation }}</div>
                  </v-row>
                  <v-row class="mt-6">
                    <v-card class="w-100" variant="tonal">
                      <v-card-text>
                        <v-container fluid>
                          <v-row>
                            <v-col>
                              <div><strong>{{t('publisher')}}:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_publisher
                                    ? selectedItem.book_publisher.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>{{t('year_of_publication')}}:</strong></div>
                              <div>{{ selectedItem.year }}</div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>УДК:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_udk
                                    ? selectedItem.book_udk.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>{{t('language')}}:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_language
                                    ? selectedItem.book_language.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>ББК:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_bbk
                                    ? selectedItem.book_bbk.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>Жанр:</strong></div>
                              <div>
                                {{
                                  selectedItem.book_genre
                                    ? selectedItem.book_genre.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="my-4">
                <v-col cols="4">
                  <div class="font-weight-bold">Ключевые слова:</div>
                </v-col>
                <v-col cols="8">
                  <v-chip v-for="item in selectedItem.quotes" :key="item" color="primary">
                    {{ item }}
                  </v-chip>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <v-row class="my-4">
                <v-col cols="4">
                  <div class="font-weight-bold">Биографическая запись:</div>
                </v-col>
                <v-col cols="8"></v-col>
              </v-row>
            </v-container>
          </v-window-item>
          <v-window-item value="two"></v-window-item>
          <v-window-item value="three"></v-window-item>
          <v-window-item value="four"></v-window-item>
        </v-window>
      </v-list-item>
    </v-navigation-drawer>

    <v-row>
      <v-col class="mx-2">
        <v-card>
          <v-card-text>
            <div class="d-flex flex-column">
              <v-row class="mb-2">
                <v-col class="d-flex" cols="9">
                  <v-text-field
                    v-model="search"
                    density="compact"
                    hide-details
                    :placeholder="t('search_by_title')"
                    prepend-inner-icon="mdi-magnify"
                    rounded
                    variant="outlined"
                  >
                    <template v-slot:append>
                      <v-menu>
                        <template v-slot:activator="{ props }">
                          <v-btn append-icon="mdi-chevron-down" v-bind="props" variant="outlined"
                            >{{ selectedType.title }}
                          </v-btn>
                        </template>

                        <v-list>
                          <v-list-item
                            v-for="item in types"
                            :key="item.id"
                            :value="item.id"
                            @click="selectedType = item"
                            >{{ item.title }}
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col class="d-flex justify-space-around">
                  <v-btn color="primary" variant="flat" @click="getBooks">{{t('search')}}</v-btn>
                  <v-btn variant="tonal" @click="resetFilters">{{t('reset')}}</v-btn>
                </v-col>
              </v-row>
              <v-row class="mb-2">
                <v-col cols="2">
                  <v-autocomplete
                    v-model="languageId"
                    :items="languages"
                    clearable
                    item-title="title"
                    item-value="id"
                    :label="t('language')"
                    variant="solo-filled"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <v-autocomplete
                    v-model="authorId"
                    :items="authors"
                    clearable
                    item-title="name"
                    item-value="id"
                    :label="t('author')"
                    variant="solo-filled"
                    @update:search="getAuthors"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного автора нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('author')"
                          >{{t('add')}}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <v-autocomplete
                    v-model="publisherId"
                    :items="publishers"
                    clearable
                    item-title="title"
                    item-value="id"
                    :label="t('publisher')"
                    variant="solo-filled"
                    @update:search="getPublishers"
                  >
                    <template v-slot:no-data>
                      <div class="px-4 d-flex justify-space-between align-center">
                        <span>Данного издателя нет в списке</span>
                        <v-btn color="primary" variant="flat" @click="setNewItem('publisher')"
                          >{{t('add')}}
                        </v-btn>
                      </div>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="2">
                  <v-text-field
                    v-model="year"
                    :label="t('year_of_publication')"
                    type="number"
                    variant="solo-filled"
                  ></v-text-field>
                </v-col>

                <v-col>
                  <v-switch v-model="epub" color="primary" :label="t('ebook')"></v-switch>
                </v-col>
              </v-row>
              <v-row>
                <v-expansion-panels>
                  <v-expansion-panel :title="t('advanced_search')">
                    <v-expansion-panel-text>
                      <v-row>
                        <v-col cols="2">
                          <v-autocomplete
                            v-model="genreId"
                            :items="genres"
                            item-value="id"
                            label="Жанр книги"
                            variant="solo-filled"
                          >
                            <template v-slot:no-data>
                              <div class="px-4 d-flex justify-space-between align-center">
                                <span>Данного жанра нет в списке</span>
                                <v-btn color="primary" variant="flat" @click="setNewItem('genre')"
                                  >{{t('add')}}
                                </v-btn>
                              </div>
                            </template>
                          </v-autocomplete>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="ББК"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="УДК"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="2">
                          <v-autocomplete
                            v-model="copyrightSignId"
                            :items="copyrightSigns"
                            item-value="id"
                            label="Авторский знак"
                            variant="solo-filled"
                            @update:search="getCopyrightSigns"
                          >
                            <template v-slot:item="{ item, props }">
                              <v-list-item
                                :title="`${item.raw.number} - ${item.raw.title}`"
                                v-bind="props"
                              >
                              </v-list-item>
                            </template>
                          </v-autocomplete>
                        </v-col>
                        <v-col cols="3">
                          <v-autocomplete
                            v-model="ageCharacteristicId"
                            :items="ageCharacteristics"
                            item-value="id"
                            label="Возрастная характеристика"
                            type="number"
                            variant="solo-filled"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="2">
                          <v-select
                            v-model="bookClassroom"
                            :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
                            label="Класс"
                            variant="solo-filled"
                          ></v-select>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="Уровень образования"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="3">
                          <v-autocomplete
                            v-model="countryId"
                            :items="countries"
                            item-value="id"
                            label="Страна издателя"
                            variant="solo-filled"
                            @update:search="getCountries"
                          ></v-autocomplete>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model="year"
                            label="Квалификация"
                            type="number"
                            variant="solo-filled"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-for="item in items" :key="item.id" class="mx-2 my-3">
      <v-card class="w-100">
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="2">
                <v-img
                  :src="item.book_cover ? getImageURL(item.book_cover.value) : nocover"
                  class="rounded"
                  fluid
                ></v-img>
              </v-col>
              <v-col cols="10">
                <v-row>
                  <v-col cols="6">
                    <v-chip
                      v-for="bookType in item.book_type"
                      :key="bookType.id"
                      color="primary"
                      variant="flat"
                    >
                      {{ bookType.title }}
                    </v-chip>
                  </v-col>
                  <v-col class="text-right" cols="6">
                    <v-chip v-if="item.book_school" color="green" variant="flat"
                      >Добавлен в фонд
                    </v-chip>
                    <v-chip v-if="item.book_epub" class="ml-2" color="success" variant="flat"
                      >EPUB
                    </v-chip>
                    <v-btn
                      v-if="item.book_epub && auth.user.value.roles.some((obj) => obj.id === 1)"
                      class="ml-2"
                      color="warning"
                      rounded="xl"
                      variant="flat"
                      @click="downloadEPUB(item.book_epub)"
                      >{{ t('download_pdf') }}
                    </v-btn>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <div class="text-h6 font-weight-bold">
                      {{ item.title }}
                      <span v-if="item.books_in_fund > 0" class="px-2 ml-2 border rounded">{{
                        item.books_in_fund
                      }}</span>
                    </div>

                    <div>{{ item.title2 }}</div>
                    <div class="mt-3">
                      <v-chip
                        v-for="author in item.book_author_main"
                        :key="author.id"
                        color="primary"
                        variant="outlined"
                        >{{ author.name }}
                      </v-chip>
                    </div>
                    <div class="mt-3">{{ item.annotation }}</div>
                  </v-col>
                  <v-col cols="6">
                    <v-card class="w-100" variant="tonal">
                      <v-card-text>
                        <v-container fluid>
                          <v-row>
                            <v-col>
                              <div><strong>{{t('publisher')}}:</strong></div>
                              <div>
                                {{
                                  item.book_publisher
                                    ? item.book_publisher.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>{{t('year_of_publication')}}:</strong></div>
                              <div>{{ item.year }}</div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>УДК:</strong></div>
                              <div>
                                {{
                                  item.book_udk
                                    ? item.book_udk.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>{{t('language')}}:</strong></div>
                              <div>
                                {{
                                  item.book_language
                                    ? item.book_language.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col>
                              <div><strong>ББК:</strong></div>
                              <div>
                                {{
                                  item.book_bbk
                                    ? item.book_bbk.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                            <v-col>
                              <div><strong>Жанр:</strong></div>
                              <div>
                                {{
                                  item.book_genre
                                    ? item.book_genre.map((obj) => obj.title).join(', ')
                                    : ''
                                }}
                              </div>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>
                    </v-card>
                    <v-row class="mt-3">
                      <v-col cols="5">
                        <v-btn
                          color="primary"
                          size="small"
                          variant="flat"
                          @click="(drawer = true), (selectedItem = item)"
                          >{{t('detailed_information')}}
                        </v-btn>
                      </v-col>
                      <v-col cols="3">
                        <v-menu>
                          <template v-slot:activator="{ props }">
                            <v-btn
                              append-icon="mdi-chevron-down"
                              color="primary"
                              size="small"
                              v-bind="props"
                              variant="flat"
                              >{{t('actions')}}
                            </v-btn>
                          </template>

                          <v-list>
                            <v-dialog max-width="650">
                              <template v-slot:activator="{ props }">
                                <v-list-item :value="1" v-bind="props"
                                  >Дополнить или исправить
                                </v-list-item>
                              </template>

                              <template v-slot:default="{ isActive }">
                                <v-card>
                                  <v-card-title>Запрос на дополнение/исправление</v-card-title>

                                  <v-card-text>
                                    <v-container fluid>
                                      <v-row>
                                        <v-col cols="4">
                                          <v-img
                                            :src="
                                              item.book_cover
                                                ? `/storage/covers/${item.book_cover.storage}`
                                                : nocover
                                            "
                                            class="rounded"
                                            fluid
                                          ></v-img>
                                        </v-col>
                                        <v-col cols="6">
                                          <div class="text-h6 font-weight-bold">
                                            {{ item.title }}
                                          </div>
                                          <div class="mt-3">
                                            <v-chip
                                              v-for="author in item.book_author_main"
                                              :key="author.id"
                                              color="primary"
                                              variant="outlined"
                                            >
                                              {{ author.name }}
                                            </v-chip>
                                          </div>
                                          <v-row class="mt-2">
                                            <v-col>
                                              <div><strong>{{t('language')}}:</strong></div>
                                              <div>
                                                {{
                                                  item.book_language
                                                    ? item.book_language
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div><strong>{{t('year_of_publication')}}:</strong></div>
                                              <div>{{ item.year }}</div>
                                            </v-col>
                                          </v-row>
                                          <v-row>
                                            <v-col>
                                              <div><strong>{{t('publisher')}}:</strong></div>
                                              <div>
                                                {{
                                                  item.book_publisher
                                                    ? item.book_publisher
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div><strong>ББК:</strong></div>
                                              <div>
                                                {{
                                                  item.book_bbk
                                                    ? item.book_bbk
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                          </v-row>
                                        </v-col>
                                      </v-row>
                                      <v-row>
                                        <v-textarea
                                          v-model="message"
                                          label="Информация для дополнения записи"
                                          placholder="Пропишите пункты, которые нужно исправить или дополнить"
                                          variant="outlined"
                                        ></v-textarea>
                                      </v-row>
                                    </v-container>
                                  </v-card-text>

                                  <v-card-actions>
                                    <v-btn
                                      class="ml-auto mr-3"
                                      variant="tonal"
                                      @click="isActive.value = false"
                                      >{{t('cancel')}}
                                    </v-btn>
                                    <v-btn
                                      class="mr-auto"
                                      color="primary"
                                      variant="flat"
                                      @click="sendRequest(item.id, message, 2, isActive)"
                                      >{{t('send')}}
                                    </v-btn>
                                  </v-card-actions>
                                </v-card>
                              </template>
                            </v-dialog>

                            <v-dialog max-width="650">
                              <template v-slot:activator="{ props }">
                                <v-list-item :value="2" v-bind="props"
                                  ><span class="text-success">Запрос удаления</span></v-list-item
                                >
                              </template>

                              <template v-slot:default="{ isActive }">
                                <v-card>
                                  <v-card-title>Запрос на удаление</v-card-title>

                                  <v-card-text>
                                    <v-container fluid>
                                      <v-row>
                                        <v-col cols="4">
                                          <v-img
                                            :src="
                                              item.book_cover
                                                ? `/storage/covers/${item.book_cover.storage}`
                                                : nocover
                                            "
                                            class="rounded"
                                            fluid
                                          ></v-img>
                                        </v-col>
                                        <v-col cols="6">
                                          <div class="text-h6 font-weight-bold">
                                            {{ item.title }}
                                          </div>
                                          <div class="mt-3">
                                            <v-chip
                                              v-for="author in item.book_author_main"
                                              :key="author.id"
                                              color="primary"
                                              variant="outlined"
                                            >
                                              {{ author.name }}
                                            </v-chip>
                                          </div>
                                          <v-row class="mt-2">
                                            <v-col>
                                              <div><strong>{{ t('language') }}:</strong></div>
                                              <div>
                                                {{
                                                  item.book_language
                                                    ? item.book_language
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div><strong>{{t('year_of_publication')}}:</strong></div>
                                              <div>{{ item.year }}</div>
                                            </v-col>
                                          </v-row>
                                          <v-row>
                                            <v-col>
                                              <div><strong>{{t('publisher')}}:</strong></div>
                                              <div>
                                                {{
                                                  item.book_publisher
                                                    ? item.book_publisher
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                            <v-col>
                                              <div><strong>ББК:</strong></div>
                                              <div>
                                                {{
                                                  item.book_bbk
                                                    ? item.book_bbk
                                                        .map((obj) => obj.title)
                                                        .join(', ')
                                                    : ''
                                                }}
                                              </div>
                                            </v-col>
                                          </v-row>
                                        </v-col>
                                      </v-row>
                                      <v-row>
                                        <v-textarea
                                          v-model="message"
                                          label="Причина"
                                          placholder="Укажите причину удаления из базы"
                                          variant="outlined"
                                        ></v-textarea>
                                      </v-row>
                                    </v-container>
                                  </v-card-text>

                                  <v-card-actions>
                                    <v-btn
                                      class="ml-auto mr-3"
                                      variant="tonal"
                                      @click="isActive.value = false"
                                      >{{t('cancel')}}
                                    </v-btn>
                                    <v-btn
                                      class="mr-auto"
                                      color="primary"
                                      variant="flat"
                                      @click="sendRequest(item.id, message, 1, isActive)"
                                      >{{t('send')}}
                                    </v-btn>
                                  </v-card-actions>
                                </v-card>
                              </template>
                            </v-dialog>
                          </v-list>
                        </v-menu>
                      </v-col>
                      <v-col cols="4">
                        <v-dialog
                          v-if="
                            auth.user.value && auth.user.value.roles.some((obj) => obj.id !== 1)
                          "
                          max-width="800"
                        >
                          <template v-slot:activator="{ props }">
                            <v-btn color="green" size="small" v-bind="props" variant="flat"
                              >{{t('add_to_fund')}}
                            </v-btn>
                          </template>

                          <template v-slot:default="{ isActive }">
                            <v-card>
                              <v-card-title>{{t('add_to_fund')}}</v-card-title>
                              <v-card-text>
                                <v-container fluid>
                                  <v-row>
                                    <v-col cols="4">
                                      <v-img
                                        :src="
                                          item.book_cover
                                            ? `/storage/covers/${item.book_cover.storage}`
                                            : nocover
                                        "
                                        class="rounded"
                                        fluid
                                      ></v-img>
                                    </v-col>
                                    <v-col cols="6">
                                      <div class="text-h6 font-weight-bold">
                                        {{ item.title }}
                                      </div>
                                      <div class="mt-3">
                                        <v-chip
                                          v-for="author in item.book_author_main"
                                          :key="author.id"
                                          color="primary"
                                          variant="outlined"
                                          >{{ author.name }}
                                        </v-chip>
                                      </div>
                                      <v-row class="mt-2">
                                        <v-col>
                                          <div><strong>{{t('language')}}:</strong></div>
                                          <div>
                                            {{
                                              item.book_language
                                                ? item.book_language
                                                    .map((obj) => obj.title)
                                                    .join(', ')
                                                : ''
                                            }}
                                          </div>
                                        </v-col>
                                        <v-col>
                                          <div><strong>{{t('year_of_publication')}}:</strong></div>
                                          <div>{{ item.year }}</div>
                                        </v-col>
                                      </v-row>
                                      <v-row>
                                        <v-col>
                                          <div><strong>{{t('publisher')}}:</strong></div>
                                          <div>
                                            {{
                                              item.book_publisher
                                                ? item.book_publisher
                                                    .map((obj) => obj.title)
                                                    .join(', ')
                                                : ''
                                            }}
                                          </div>
                                        </v-col>
                                        <v-col>
                                          <div><strong>ББК:</strong></div>
                                          <div>
                                            {{
                                              item.book_bbk
                                                ? item.book_bbk.map((obj) => obj.title).join(', ')
                                                : ''
                                            }}
                                          </div>
                                        </v-col>
                                      </v-row>
                                    </v-col>
                                  </v-row>
                                  <v-row>
                                    <v-col>
                                      <v-autocomplete
                                        v-model="admission.book_admission_id"
                                        :items="admissions"
                                        item-value="id"
                                        :label="t('reception')"
                                        placeholder="Выберите"
                                        variant="outlined"
                                      ></v-autocomplete>
                                    </v-col>
                                    <v-col>
                                      <v-text-field
                                        v-model="admission.admission_at"
                                        :label="t('reception_date')"
                                        placeholder="ДД.ММ.ГГ"
                                        type="date"
                                        variant="outlined"
                                      ></v-text-field>
                                    </v-col>
                                  </v-row>

                                  <v-row>
                                    <v-col>
                                      <v-autocomplete
                                        v-model="admission.contractor_id"
                                        :items="contractors"
                                        item-value="id"
                                        :label="t('counterparty')"
                                        placeholder="Укажите"
                                        variant="outlined"
                                        @update:search="getContractors"
                                      >
                                        <template v-slot:no-data>
                                          <div
                                            class="px-4 d-flex justify-space-between align-center"
                                          >
                                            <span>Данного контрагента нет в списке</span>
                                            <v-btn
                                              color="primary"
                                              variant="flat"
                                              @click="setNewItem('contractor')"
                                              >{{t('add')}}
                                            </v-btn>
                                          </div>
                                        </template>
                                      </v-autocomplete>
                                    </v-col>
                                  </v-row>

                                  <v-row>
                                    <v-col>
                                      <v-text-field
                                        v-model="admission.amount"
                                        :label="t('quantity')"
                                        placeholder="Выберите"
                                        type="number"
                                        variant="outlined"
                                      ></v-text-field>
                                    </v-col>
                                    <v-col>
                                      <v-text-field
                                        v-model="admission.price"
                                        :label="t('price')"
                                        placeholder="0,00"
                                        step="0.01"
                                        type="number"
                                        variant="outlined"
                                      ></v-text-field>
                                    </v-col>
                                  </v-row>

                                  <v-row>
                                    <v-col>
                                      <v-autocomplete
                                        v-model="admission.book_state_id"
                                        :items="states"
                                        item-value="id"
                                        :label="t('book_condition')"
                                        placeholder="Выберите"
                                        variant="outlined"
                                      ></v-autocomplete>
                                    </v-col>
                                  </v-row>
                                </v-container>
                              </v-card-text>

                              <v-card-actions>
                                <v-btn
                                  class="ml-auto mr-3"
                                  variant="tonal"
                                  @click="isActive.value = false"
                                  >{{t('cancel')}}
                                </v-btn>
                                <v-btn
                                  class="mr-auto"
                                  color="primary"
                                  variant="flat"
                                  @click="sendAdmission(admission, isActive, item.id)"
                                  >{{t('send')}}
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </template>
                        </v-dialog>

                        <v-dialog
                          v-if="
                            auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1)
                          "
                          width="600"
                        >
                          <template v-slot:activator="{ props }">
                            <v-btn
                              class="mr-3"
                              color="red"
                              size="small"
                              v-bind="props"
                              variant="flat"
                            >
                              <v-icon icon="mdi-delete"></v-icon>
                            </v-btn>
                          </template>

                          <template v-slot:default="{ isActive }">
                            <v-card
                              class="text-center"
                              text="Вы уверены что хотите библиографическию запись?"
                              title="Удаление"
                            >
                              <v-card-actions>
                                <v-btn
                                  class="ml-auto mr-3"
                                  color="primary"
                                  variant="flat"
                                  @click="deleteItem(item.id, isActive)"
                                  >{{t('yes')}}
                                </v-btn>
                                <v-btn
                                  class="mr-auto"
                                  variant="tonal"
                                  @click="isActive.value = false"
                                  >Отмена
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </template>
                        </v-dialog>

                        <v-btn
                          v-if="
                            auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1)
                          "
                          :to="`/m-data/edit/${item.id}`"
                          class="rounded"
                          color="green"
                          size="small"
                          variant="flat"
                        >
                          <v-icon icon="mdi-pencil"></v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-row>

    <v-row class="mt-4">
      <v-pagination
        v-model="page"
        :length="length"
        :total-visible="6"
        active-color="primary"
        class="ml-auto mr-2"
        size="small"
        variant="flat"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
