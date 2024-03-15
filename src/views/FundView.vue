<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue'
import bookForm from '@/assets/book-form.pdf'
import catalogCard from '@/assets/catalog-card.pdf'
import publisher from '@/assets/publisher.pdf'
import admission from '@/assets/admission.pdf'
import fund from '@/assets/fund.pdf'
import noCover from '@/assets/no-book-cover.svg'
import nonfiction from '@/assets/admission_nonfiction.pdf'
import fiction from '@/assets/admission_fiction.pdf'

const api = useAPI()

interface Contractor {
  address: string
  company_ID: string
  id: number
  system: boolean
  title: string
}

interface Book {
  id: number
  price: number
  book: SubBook | null
  book_annotation: string
  amount: number
  book_ISBN: string
  book_author_main: { id: number; name: string }[]
  book_pages: number
  book_language: string[]
  contractor: string
  book_state: string
  book_bbk: { id: number; title: string }[]
  admission_at: string
  book_admission_id: number
}

interface SubBook {
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

interface Publisher {
  id: number
  title: string
}

const loading: Ref<boolean> = ref(false)
const items: Ref<Book[] | null> = ref(null)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(0)
const admissions: Ref<Publisher[]> = ref([])
const contractors: Ref<Contractor[]> = ref([])
const states: Ref<Publisher[]> = ref([])
const selectedItem: Ref<Book> = ref({
  id: 0,
  price: 0,
  book: null,
  book_annotation: '',
  amount: 0,
  book_ISBN: '',
  book_author_main: [],
  book_pages: 0,
  book_language: [],
  contractor: '',
  book_state: '',
  book_bbk: [],
  admission_at: '',
  book_admission_id: 0
})

async function getBooks() {
  loading.value = true
  try {
    const response = await api.fetchData<{ data: Book[]; meta: { last_page: number } }>(
      `https://test.api.qazaqmura.kz/v2/book/school?page=${page.value}`
    )

    if (response.data) {
      items.value = response.data.data
      length.value = response.data.meta.last_page
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const filterBlock = {
  bottomItems: [
    { label: 'Название книги', value: 42 },
    { label: 'Количество книг', value: 300 },
    { label: 'Сумма поступления книг', value: 300000000 }
  ]
}

function downloadPDF(title: string) {
  const link = document.createElement('a')
  if (title === 'bookForm') {
    link.href = bookForm
  } else if (title === 'publisher') {
    link.href = publisher
  } else if (title === 'admission') {
    link.href = admission
  } else if (title === 'fund') {
    link.href = fund
  } else if (title === 'nonfiction') {
    link.href = nonfiction
  } else if (title === 'fiction') {
    link.href = fiction
  } else {
    link.href = catalogCard
  }
  link.download = 'document.pdf'
  link.click()
  document.body.removeChild(link)
}

async function submitClear(isActive: Ref<boolean>, bookId: number | null) {
  try {
    await api.deleteData(`https://test.api.qazaqmura.kz/v1/book/school/inventory/${bookId}`)
    isActive.value = false
    await getBooks()
  } catch (error) {
    console.error('Error:', error)
  }
}

async function submitDeletion(isActive: Ref<boolean>, bookId: number) {
  try {
    await api.deleteData(`https://test.api.qazaqmura.kz/v1/book/school/${bookId}`)
    isActive.value = false
    await getBooks()
  } catch (error) {
    console.error('Error:', error)
  }
}

async function getAdmissions(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/book/admission`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) admissions.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getContractors(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/contractor`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Contractor[] } }>(request)
    if (response.data) contractors.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getStates(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/book/state`
    if (search) {
      request += `?search=${search}`
    }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) states.value = response.data.data.items
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

getBooks()
getAdmissions()
getContractors()
getStates()

watch(page, () => {
  getBooks()
})
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Фонд</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >База данных по РК (библиографических записей)</span
          >
        </div>
      </template>

      <template v-slot:append>
        <v-btn class="mr-3" color="primary" variant="flat">Генерация документов</v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              append-icon="mdi-chevron-down"
              class="mr-3"
              color="primary"
              v-bind="props"
              variant="flat"
              >Скачать список
            </v-btn>
          </template>

          <v-list>
            <v-list-item value="publisher" @click="downloadPDF('publisher')"
              >Отчет по издателям
            </v-list-item>
            <v-list-item value="admission" @click="downloadPDF('admission')"
              >Список поступлений
            </v-list-item>
            <v-list-item value="fund" @click="downloadPDF('fund')">Список фонда</v-list-item>
            <v-list-item value="nonfiction" @click="downloadPDF('nonfiction')"
              >Список худ литературы
            </v-list-item>
            <v-list-item value="fiction" @click="downloadPDF('fiction')"
              >Список учебников
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn prepend-icon="mdi-video-outline" variant="tonal">Помощь</v-btn>
      </template>
    </v-app-bar>

    <v-row class="mx-2 my-3">
      <v-col>
        <FilterBlock
          :bottom-items="filterBlock.bottomItems"
          :inventory="false"
          :mdata="true"
          :one-line="false"
          :users="false"
        >
        </FilterBlock>
      </v-col>
    </v-row>

    <v-row v-for="item in items" :key="item.id" class="mx-2 my-3">
      <v-card class="w-100">
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="2">
                <v-img :src="noCover" fluid></v-img>
              </v-col>
              <v-col cols="2">
                <div class="mb-2">
                  <span class="text-h5 font-weight-bold">{{
                    item.book ? item.book.title : ''
                  }}</span>
                </div>

                <v-chip
                  v-for="author in item.book_author_main"
                  :key="author.id"
                  color="primary"
                  variant="outlined"
                  >{{ author.name }}
                </v-chip>
              </v-col>
              <v-col cols="5">
                <v-card class="w-100" variant="tonal">
                  <v-card-text>
                    <v-container fluid>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>Год издания:</strong></div>
                          <div>{{ item.book ? item.book.year : '' }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Язык:</strong></div>
                          <div>{{ item.book_language ? item.book_language.join(', ') : '' }}</div>
                        </v-col>
                        <v-col cols="4"></v-col>
                      </v-row>
                      <v-divider class="my-3"></v-divider>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>Контрагенты:</strong></div>
                          <div>{{ item.contractor }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Дата поступления:</strong></div>
                          <div>{{ item.admission_at }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Состояние:</strong></div>
                          <div>{{ item.book_state }}</div>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>Количество:</strong></div>
                          <div>{{ item.amount }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Цена:</strong></div>
                          <div>{{ item.book ? item.book.amount : '' }} ₸</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Цена за все:</strong></div>
                          <div>{{ item.price }} ₸</div>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col>
                <v-btn
                  block
                  class="mb-2"
                  color="primary"
                  variant="flat"
                  @click="downloadPDF('bookForm')"
                  >Книжный формуляр
                </v-btn>
                <v-btn
                  block
                  class="mb-2"
                  color="primary"
                  variant="flat"
                  @click="downloadPDF('catalogCard')"
                  >Каталожная карточка
                </v-btn>
                <v-dialog max-width="650">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      block
                      class="mb-2"
                      color="primary"
                      v-bind="props"
                      variant="outlined"
                      @click="selectedItem = item"
                      >Изменить данные
                    </v-btn>
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-card title="Изменить">
                      <v-card-text>
                        <v-container fluid>
                          <v-row>
                            <v-col cols="4">
                              <v-img
                                :src="
                                  item.book && item.book.book_cover
                                    ? `https://test.api.qazaqmura.kz/storage/covers/${item.book.book_cover.storage}`
                                    : noCover
                                "
                                class="rounded"
                                fluid
                              ></v-img>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-h6 font-weight-bold">
                                {{ item.book ? item.book.title : '' }}
                              </div>
                              <div v-if="item.book" class="mt-3">
                                <v-chip
                                  v-for="author in item.book.book_author_main"
                                  :key="author.id"
                                  color="primary"
                                  variant="outlined"
                                  >{{ author.name }}
                                </v-chip>
                              </div>
                              <v-row class="mt-2">
                                <v-col>
                                  <div><strong>Язык:</strong></div>
                                  <div>
                                    {{
                                      item.book_language
                                        ? item.book_language.map((obj) => obj).join(', ')
                                        : ''
                                    }}
                                  </div>
                                </v-col>
                                <v-col>
                                  <div><strong>Год издания:</strong></div>
                                  <div>{{ item.book ? item.book.year : '' }}</div>
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col>
                                  <div><strong>Издатель:</strong></div>
                                  <div>
                                    {{ item.contractor }}
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
                          <v-row class="d-flex flex-column">
                            <v-autocomplete
                              v-model="selectedItem.book_admission_id"
                              :items="admissions"
                              item-value="id"
                              label="Поступление"
                              placeholder="Выберите"
                              variant="outlined"
                            ></v-autocomplete>
                            <v-autocomplete
                              v-model="selectedItem.book_admission_id"
                              :items="contractors"
                              item-value="id"
                              label="Контрагент"
                              placeholder="Выберите"
                              variant="outlined"
                            ></v-autocomplete>
                            <v-text-field
                              v-model="selectedItem.admission_at"
                              label="Дата поступления"
                              type="date"
                              variant="outlined"
                            ></v-text-field>
                            <v-text-field
                              v-model="selectedItem.price"
                              label="Цена"
                              type="number"
                              variant="outlined"
                            ></v-text-field>
                            <v-text-field
                              v-model="selectedItem.amount"
                              label="Количество"
                              type="number"
                              variant="outlined"
                            ></v-text-field>
                            <v-autocomplete
                              v-model="selectedItem.book_admission_id"
                              :items="states"
                              item-value="id"
                              label="Состояние книги"
                              placeholder="Выберите"
                              variant="outlined"
                            ></v-autocomplete>
                          </v-row>
                        </v-container>
                      </v-card-text>

                      <v-card-actions>
                        <v-btn
                          class="ml-auto"
                          color="primary"
                          variant="flat"
                          @click="isActive.value = false"
                          >Сохранить
                        </v-btn>
                        <v-btn class="ml-3 mr-auto" variant="tonal" @click="isActive.value = false"
                          >Отмена
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>

                <v-dialog max-width="500">
                  <template v-slot:activator="{ props }">
                    <v-btn block class="mb-2" color="primary" v-bind="props" variant="outlined"
                      >Сброс инвентаризации
                    </v-btn>
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-card
                      text="Вы уверены что хотите сбросить из фонда инвентаризационные номера?"
                      title="Сброс инвентаризации"
                    >
                      <v-card-actions>
                        <v-btn
                          class="ml-auto"
                          color="primary"
                          variant="flat"
                          @click="submitClear(isActive, item.book ? item.book.id : null)"
                          >Да, сбросить
                        </v-btn>
                        <v-btn class="ml-3 mr-auto" variant="tonal" @click="isActive.value = false"
                          >Отмена
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>

                <v-dialog max-width="500">
                  <template v-slot:activator="{ props }">
                    <v-btn block class="mb-2" color="error" v-bind="props" variant="outlined"
                      >Удалить из фонда
                    </v-btn>
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-card text="Вы уверены что хотите удалить из фонда?" title="Удаление">
                      <v-card-actions>
                        <v-btn
                          class="ml-auto"
                          color="primary"
                          variant="flat"
                          @click="submitDeletion(isActive, item.book ? item.book.id : 0)"
                          >Да, удалить
                        </v-btn>
                        <v-btn class="ml-3 mr-auto" variant="tonal" @click="isActive.value = false"
                          >Отмена
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>
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
        :total-visible="4"
        active-color="primary"
        class="ml-auto mr-2"
        size="small"
        variant="flat"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
