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
import HelpButton from '@/components/HelpButton.vue'
import fileDownload from 'js-file-download'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
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

interface Filter {
  search: string
  languageId: number | null
  authorId: number | null
  publisherId: number | null
  year: number | null
  epub: boolean
}

const filters: Ref<Filter> = ref({
  search: '',
  languageId: null,
  authorId: null,
  publisherId: null,
  year: null,
  epub: false
})

const types: Ref<Type[]> = ref([])
const selectedTypeId: Ref<number[] | null> = ref(null)

async function getBooks() {
  loading.value = true
  try {
    let request = `/v2/book/school?page=${page.value}`
    if (filters.value.search) request += `&book=${filters.value.search}`
    if (filters.value.publisherId) request += `&publisher_id=${filters.value.publisherId}`
    if (filters.value.authorId) request += `&author_id=${filters.value.authorId}`
    if (filters.value.languageId) request += `&language_id=${filters.value.languageId}`
    if (filters.value.year) request += `&year=${filters.value.year}`
    if (filters.value.epub) request += `&epub=1`

    const response = await api.fetchData<{ data: Book[]; meta: { last_page: number } }>(request)
    items.value = response.data.data || []
    length.value = response.data.meta.last_page || 1
  } catch (error) {
    console.error('Error fetching books:', error)
  } finally {
    loading.value = false
  }
}

const editData = async (isActive: Ref<boolean>) => {
  const bookSchoolForm = {
    amount: selectedItem.value.amount,
    price: selectedItem.value.price,
    admission_at: admissionDate.value,
    contractor_id: selectedItem.value.contractor.id
  }
  await api.putData(`/v1/book/school/${selectedItem.value.book_school_id}`, bookSchoolForm)
  await getBooks()

  isActive.value = false
}

const filterBlock = {
  bottomItems: [
    { label: t('book_title'), value: 42 },
    { label: 'Количество книг', value: 300 },
    { label: t('amount_received'), value: 300000000 }
  ]
}

async function downloadPDF(title: string, id?: number) {
  const link = document.createElement('a')
  if (title === 'bookForm') {
    const response = await api.postData(`/v1/book/school/book-form/pdf/${id}`, null, true)
    if (response.data) fileDownload(response.data, 'Книжный формуляр.pdf')
  } else if (title === 'publisher') {
    const response = await api.postData(`/v1/book/school/publisher/pdf`, null, true)
    if (response.data) fileDownload(response.data, 'Отчет по издателям.pdf')
  } else if (title === 'admission') {
    const response = await api.postData('/v1/book/school/admission/pdf', null, true)
    if (response.data) fileDownload(response.data, 'admission.pdf')
  } else if (title === 'fund') {
    const response = await api.postData('/v1/book/school/book/pdf', null, true)
    if (response.data) fileDownload(response.data, 'school_fund.pdf')
  } else if (title === 'nonfiction') {
    const response = await api.postData('/v1/book/school/book/pdf?type_id=1', null, true)
    if (response.data) fileDownload(response.data, 'Список учебников.pdf')
  } else if (title === 'fiction') {
    const response = await api.postData('/v1/book/school/book/pdf?type_id=17', null, true)
    if (response.data) fileDownload(response.data, 'Список основного фонда.pdf')
  } else {
    const response = await api.postData(`/v1/book/school/catalog-card/pdf/${id}`, null, true)
    if (response.data) fileDownload(response.data, 'Каталожная карточка.pdf')
  }
  // link.download = 'document.pdf'
  // link.click()
  // document.body.removeChild(link)
}

async function submitClear(isActive: Ref<boolean>, bookId: number | null) {
  try {
    const response = await api.deleteData(`/v1/book/school/inventory/${bookId}`)
    isActive.value = false
    await getBooks()
    snackbar.value = true
    snackbarText.value = response.data.message
  } catch (error) {
    console.error('Error:', error)
  }
}

const admissionDate = ref('')

const handleDate = () => {
  let value = admissionDate.value.replace(/\D/g, '')
  if (value.length >= 3) {
    value = value.slice(0, 2) + '.' + value.slice(2)
  }
  if (value.length >= 6) {
    value = value.slice(0, 5) + '.' + value.slice(5)
  }
  if (value.length >= 10) {
    value = value.slice(0, 10)
  }
  admissionDate.value = value
}

async function submitDeletion(isActive: Ref<boolean>, bookId: number) {
  try {
    const response = await api.deleteData(`/v1/book/school/${bookId}`)
    isActive.value = false
    snackbar.value = true
    snackbarText.value = response.data.message
    await getBooks()
  } catch (error) {
    console.error('Error:', error)
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

async function selectItem(item) {
  console.log(item)

  const response = await api.fetchData('/v1/book/school/' + item.book_school_id)
  selectedItem.value.amount = response.data.amount
  selectedItem.value.contractor = response.data.contractor_id
  selectedItem.value.price = response.data.price
  selectedItem.value.book_admission_id = response.data.book_admission_id
  selectedItem.value.book_state_id = response.data.book_state_id
  admissionDate.value = response.data.admission_at
}

const admissionBlock: Ref<{ label: string; value: string }> = ref([])

async function getAdmissionBlock() {
  try {
    const response = await api.fetchData<{
      amount: string
      price: string
      type: string
    }>('/v1/book/school/admission')
    if (response.data) {
      admissionBlock.value = [
        { label: t('book_title'), value: response.data.type },
        { label: 'Количество книг', value: response.data.amount },
        { label: t('amount_received'), value: response.data.price }
      ]
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const snackbar = ref(false)
const snackbarText = ref('')

// const getTotal = (price: number, amount: number) => {
//   if (!price || !amount) return ''
//   else return price * amount + ' ₸'
// }

const getTotal = (price: number, amount: number) => {
  return price && amount ? `${price * amount} ₸` : ''
}

getBooks()
getAdmissions()
getContractors()
getStates()
getAdmissionBlock()

watch(page, () => {
  getBooks()
})
</script>

<template>
  <v-container fluid>
    <v-snackbar v-model="snackbar" :timeout="1000">{{ snackbarText }}</v-snackbar>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{t('fund')}}</span>
          <span class="text-subtitle-2 text-medium-emphasis"Q
            >{{t('database_by_rk')}}</span
          >
        </div>
      </template>

      <template v-slot:append>
        <!-- <v-btn class="mr-3" color="primary" variant="flat">{{t('document_generation')}}</v-btn> -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              append-icon="mdi-chevron-down"
              class="mr-3"
              color="primary"
              v-bind="props"
              variant="flat"
              >{{ t('download_pdf') }}
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
            <v-list-item value="nonfiction" @click="downloadPDF('fiction')"
              >Список основного фонда
            </v-list-item>
            <v-list-item value="fiction" @click="downloadPDF('nonfiction')"
              >Список учебников
            </v-list-item>
          </v-list>
        </v-menu>
        <HelpButton video-id="ASELCx5TId8" />
      </template>
    </v-app-bar>

    <v-row class="mx-2 my-3">
      <v-col>
        <FilterBlock
         v-model="filters"
         :bottom-items="[]"
         :inventory="false"
         :mdata="true"
         :one-line="false"
         :users="false"
         @search="getBooks"
        />
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
              <v-col cols="6">
                <v-card class="w-100" variant="tonal">
                  <v-card-text>
                    <v-container fluid>
                      <v-row class="d-flex flex-column">
                        <div class="mb-2">
                          <v-chip
                            v-for="bookType in item.type"
                            :key="bookType"
                            color="primary"
                            variant="flat"
                          >
                            {{ bookType }}
                          </v-chip>
                        </div>
                        <div class="mb-2">
                          <span class="text-h5 font-weight-bold">{{ item.book }}</span>
                        </div>
                        <div class="d-flex flex-row">
                          <v-chip
                            v-for="author in item.author_main"
                            :key="author.id"
                            color="primary"
                            variant="outlined"
                            >{{ author }}
                          </v-chip>
                        </div>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>{{t('year_of_publication')}}:</strong></div>
                          <div>{{ item.year }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>{{t('language')}}:</strong></div>
                          <div>{{ item.language ? item.language.join(', ') : '' }}</div>
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
                          <div><strong>{{t('reception_date')}}:</strong></div>
                          <div>{{ item.admission_at }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Состояние:</strong></div>
                          <div>{{ item.book_state }}</div>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>{{ t('quantity') }}:</strong></div>
                          <div>{{ item.amount }}</div>
                        </v-col>
                        <v-col v-if="item.price" cols="4">
                          <div><strong>{{t('price')}}:</strong></div>
                          <div>{{ item.price }} ₸</div>
                        </v-col>
                        <v-col v-if="item.price && item.amount" cols="4">
                          <div><strong>Цена за все:</strong></div>
                          <div>{{ getTotal(item.price, item.amount) }}</div>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="4">
                <v-btn
                  block
                  class="mb-2"
                  color="primary"
                  variant="flat"
                  @click="downloadPDF('bookForm', item.book_school_id)"
                  >Книжный формуляр
                </v-btn>
                <v-btn
                  block
                  class="mb-2"
                  color="primary"
                  variant="flat"
                  @click="downloadPDF('catalogCard', item.book_school_id)"
                  >Каталожная карточка
                </v-btn>
                <v-dialog max-width="68vw">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      block
                      class="mb-2"
                      color="primary"
                      v-bind="props"
                      variant="outlined"
                      @click="selectItem(item)"
                      >{{t('edit_data')}}
                    </v-btn>
                  </template>

                  <template v-slot:default="{ isActive }">
                    <v-card :title="t('edit')">
                      <v-card-text>
                        <v-container fluid>
                          <v-row>
                            <v-col cols="4">
                              <v-img
                                :src="
                                  item.book && item.book.book_cover
                                    ? `/storage/covers/${item.book.book_cover.value}`
                                    : noCover
                                "
                                class="rounded"
                                fluid
                              ></v-img>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-h6 font-weight-bold">
                                {{ item.book ? item.book : '' }}
                              </div>
                              <div v-if="item.author_main" class="mt-3">
                                <v-chip
                                  v-for="author in item.author_main"
                                  :key="author"
                                  color="primary"
                                  variant="outlined"
                                  >{{ author }}
                                </v-chip>
                              </div>
                              <v-row class="mt-2">
                                <v-col>
                                  <div><strong>{{t('language')}}:</strong></div>
                                  <div>
                                    {{
                                      item.book_language
                                        ? item.book_language.map((obj) => obj).join(', ')
                                        : ''
                                    }}
                                  </div>
                                </v-col>
                                <v-col>
                                  <div><strong>{{t('year_of_publication')}}:</strong></div>
                                  <div>{{ item.book ? item.book.year : '' }}</div>
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col>
                                  <div><strong>{{t('publisher')}}:</strong></div>
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
                              :label="t('reception')"
                              placeholder="Выберите"
                              variant="outlined"
                            ></v-autocomplete>
                            <v-autocomplete
                              v-model="selectedItem.contractor"
                              :items="contractors"
                              item-value="id"
                              :label="t('counterparty')"
                              placeholder="Выберите"
                              variant="outlined"
                            ></v-autocomplete>
                            <v-text-field
                              v-model="admissionDate"
                              label="Дата поступления"
                              type="text"
                              variant="outlined"
                              @input="handleDate"
                            ></v-text-field>
                            <v-text-field
                              v-model="selectedItem.price"
                              :label="t('price')"
                              type="number"
                              variant="outlined"
                            ></v-text-field>
                            <v-text-field
                              v-model="selectedItem.amount"
                              :label="t('quantity')"
                              type="number"
                              variant="outlined"
                            ></v-text-field>
                            <v-autocomplete
                              v-model="selectedItem.book_state_id"
                              :items="states"
                              item-value="id"
                              :label="t('book_condition')"
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
                          @click="editData(isActive)"
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
                          @click="
                            submitClear(isActive, item.book_school_id ? item.book_school_id : null)
                          "
                          >{{t('yes')}}
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
                          @click="
                            submitDeletion(isActive, item.book_school_id ? item.book_school_id : 0)
                          "
                          >{{t('yes')}}
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
        :total-visible="6"
        active-color="primary"
        class="ml-auto mr-2"
        size="small"
        variant="flat"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
