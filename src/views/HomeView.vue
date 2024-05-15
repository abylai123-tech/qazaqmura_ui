<!-- eslint-disable vue/valid-v-slot -->

<script lang="ts" setup>
import { useAuth } from '@/auth/index'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut, Pie } from 'vue-chartjs'
import StatisticsList from '@/components/home/StatisticsList.vue'
import SubscriptionTable from '@/components/home/SubscriptionTable.vue'
import { computed, type Ref, ref, watch } from 'vue'
import { useAPI } from '@/api'
import PublishersModal from '@/components/home/PublishersModal.vue'
import CountryModal from '@/components/home/CountryModal.vue'
import ClassModalVue from '@/components/home/ClassModal.vue'
import FundModalVue from '@/components/home/FundModal.vue'
import publisherPDF from '@/assets/publisherPDF.pdf'
import AgesModal from '@/components/home/AgesModal.vue'
import HistoryTable from '@/components/home/HistoryTable.vue'
import PublisherTable from '@/components/home/PublisherTable.vue'
import spros from '@/assets/spros.pdf'
import report from '@/assets/report.pdf'
import ministryReport from '@/assets/fund-performance.pdf'
import fileDownload from 'js-file-download'
import qazaqstan from '@/assets/flags/qazaqstan.svg'
import world from '@/assets/flags/world.svg'

const auth = useAuth()
const api = useAPI()

const doughnut = {
  labels: ['Годовой', 'Выдача', 'Возврат'],
  datasets: [
    {
      backgroundColor: ['#0095FF', '#00E096', '#884DFF'],
      data: [68, 10, 22]
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false
}

interface BookState {
  title: string
  amount: string
  books: number
}

interface Publisher {
  publisher_id: number
  publisher: string
  amount: string
  books: number
}

interface UserAge {
  age: string
  count: number
  percent: string
}

async function getBookState(): Promise<void> {
  fundLoading.value = true
  try {
    const response = await api.fetchData<BookState[]>('/v1/dashboard/book/state')
    fund.value = response.data
    fund.value.forEach((item) => {
      const bookState = bookStates.value.find((state) => {
        return state.title === item.title
      })
      item.id = bookState.id
    })
    fundLoading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const classroomHeaders: { key: string; title: string }[] = [
  { key: 'name', title: 'ФИО' },
  { key: 'books', title: 'Книги' },
  {
    key: 'amount',
    title: 'Формуляр'
  },
  {
    key: 'actions',
    title: ''
  }
]

const classroomItems: { name: string; books: number; amount: number }[] = [
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 },
  { name: 'Новое', books: 25, amount: 100 }
]

async function getPublishers(): Promise<void> {
  publishersLoading.value = true
  try {
    const response = await api.fetchData<Publisher[]>('/v1/dashboard/publisher')
    publishers.value = response.data
    publishersLoading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const readers = [
  { classname: '1 класс', amount: 25 },
  { classname: '2 класс', amount: 25 },
  { classname: '3 класс', amount: 25 },
  { classname: '4 класс', amount: 25 }
]

const headers = [
  { key: 'classname', title: 'Классы' },
  { key: 'amount', title: 'Количество' }
]

const publisherTableHeaders = [
  { key: 'title', title: 'Регионы' },
  {
    key: 'amount',
    title: 'Количество'
  }
]

const publisherTableItems = [
  { title: 'Регионы 1', amount: 25 },
  { title: 'Регионы 2', amount: 25 },
  { title: 'Регионы 3', amount: 25 },
  { title: 'Регионы 4', amount: 25 }
]

const countries = [
  {
    id: 1,
    code: 'kz',
    flag: qazaqstan,
    name: 'Казахстан',
    progress: 68.42
  },
  {
    id: 2,
    code: 'kz',
    flag: world,
    name: 'Зарубежные',
    progress: 10.52
  }
]

const fundHeaders = [
  { key: 'title', title: 'Название' },
  { key: 'books', title: 'Наименование книг' },
  { key: 'amount', title: 'Экземпляры книг' },
  { key: 'actions', title: '' }
]

const userAges: Ref<UserAge[]> = ref([])

async function getUserAges() {
  try {
    const response = await api.fetchData<UserAge[]>('/v1/dashboard/user/age')
    if (response.data) userAges.value = response.data
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const fund: Ref<BookState[] | null> = ref(null)

const fundLoading: Ref<boolean> = ref(false)

const publisherHeaders = [
  { key: 'publisher', title: 'Название' },
  { key: 'books', title: 'Наименование книг' },
  { key: 'amount', title: 'Экземпляры книг' }
]

const publishers: Ref<Publisher[] | null> = ref(null)

const publishersLoading: Ref<boolean> = ref(false)

ChartJS.register(ArcElement, Tooltip, Legend)

const agesChartData = computed(() => {
  return {
    labels: userAges.value.map((user) => user.age),
    datasets: [
      {
        backgroundColor: ['#0095FF', '#00E096', 'red', '#884DFF'],
        data: userAges.value.map((user) => Number.parseFloat(user.percent))
      }
    ]
  }
})

const pieChartData = computed(() => {
  return {
    labels: ['Экземпляров', 'Наименований'],
    datasets: [
      {
        backgroundColor: ['#0095FF', '#00E096'],
        data: [bookSchools.value.amount, bookSchools.value.books]
      }
    ]
  }
})

const tab = ref(1)

const role = computed(() => {
  return auth.user.value && auth.user.value.roles[0] ? auth.user.value.roles[0].id : 0
})

const librarianStatistics = ref([
  { subtitle: 'М-DATA', color: '#0161F2', title: 0, route: '/m-data' },
  { subtitle: 'Школьный фонд', color: '#6900C7', title: 0, route: '/fund' },
  { subtitle: 'Наименование книг', color: '#F86300', title: 0, name: 'admission' },
  { subtitle: 'Сумма поступления', color: '#05AC69', title: 0 },
  { subtitle: 'Списанных с фонда', color: '#E81600', title: 0, name: 'refund' }
])

const classroomStatistics = [
  { subtitle: 'Читатели', color: '#0161F2', title: 2000 },
  { subtitle: 'Выдачи', color: '#6900C7', title: 300 },
  { subtitle: 'Возвраты', color: '#F86300', title: 100 },
  { subtitle: 'Заявки', color: '#05AC69', title: 12000000 }
]

const publisherStatistics = [
  { subtitle: 'Количество книг в базе', color: '#0161F2', title: 2000 },
  { subtitle: 'Количество книг по фонду', color: '#6900C7', title: 300 },
  { subtitle: 'Количество экз. по фонду', color: '#F86300', title: 100 }
]

const ministryStatistics = ref([
  { subtitle: 'Количество школ в базе', color: '#0161F2', title: 0 },
  { subtitle: 'Количество записей в системе', color: '#6900C7', title: 0 },
  { subtitle: 'Количество библиотекарей в системе', color: '#F86300', title: 0 },
  { subtitle: 'Сумма поступления', color: '#05AC69', title: 0 },
  { subtitle: 'Количество читателей', color: '#E81600', title: 0 },
  { subtitle: 'Электронные книги', color: '#E8C300', title: 0 }
])

const statistics = computed(() => {
  if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 3)) {
    return librarianStatistics.value
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 4)) {
    return classroomStatistics
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 7)) {
    return publisherStatistics
  } else if (
    auth.user.value &&
    (auth.user.value.roles.some((obj) => obj.id === 8) ||
      auth.user.value.roles.some((obj) => obj.id === 1))
  ) {
    return ministryStatistics.value
  }
  return []
})

async function downloadPDF(id) {
  const response = await api.postData(
    `/v1/book/school/book-state/pdf?book_state_id=${id}`,
    null,
    true
  )
  if (response.data) fileDownload(response.data, 'Состояние по фонду книг.pdf')
}

function downloadMinistryReport() {
  const link = document.createElement('a')
  link.href = ministryReport
  link.download = 'document.pdf'
  link.click()
  document.body.removeChild(link)
}

const requests: Ref<any[]> = ref([])

async function getRequests(page = 1) {
  try {
    const response = await api.fetchData<{ data: { items: any[] } }>(
      `/v1/purchase/book/query/school-list?page=${page}`
    )
    if (response.data) {
      requests.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

function downloadPublisher() {
  const link = document.createElement('a')
  link.href = publisherPDF
  link.download = 'document.pdf'
  link.click()
  document.body.removeChild(link)
}

const downloadSpros = () => {
  const link = document.createElement('a')
  link.href = spros
  link.download = 'spros.pdf'
  link.click()
  document.body.removeChild(link)
}

const downloadReport = () => {
  const link = document.createElement('a')
  link.href = report
  link.download = 'report.pdf'
  link.click()
  document.body.removeChild(link)
}

interface Purchase {
  id: number
  title: string
  year: number
  description: string
  type: {
    id: number
    title: string
  }
  authors_main: {
    id: number
    name: string
  }[]
  authors: {
    id: number
    name: string
  }[]
  genres: {
    id: number
    title: string
  }[]
  language: {
    id: number
    title: string
  }
  publisher: {
    id: number
    title: string
  }
}

const purchases: Ref<Purchase[]> = ref([])

const getBookPurchase = async () => {
  try {
    const response = await api.fetchData<{
      data: { items: Purchase[] }
    }>('/v1/purchase/book')
    if (response.data) {
      purchases.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const regionDetails: Ref<
  { key: string; modal: boolean; title: string; value: number | string; sub?: any[] }[]
> = ref([])
const dashboardLanguages: Ref<any[]> = ref([])
const popularBooks: Ref<any[]> = ref([])
const bookTypes: Ref<any[]> = ref([])
const ratings: Ref<any[]> = ref([])
const organizations: Ref<any[]> = ref([])
const bookSchools = ref({
  amount: 0,
  books: 0
})

async function getRegionDetails() {
  regionDetailsLoaded.value = false
  try {
    let url = '/v1/dashboard/ministry/details'
    if (selectedThirdRegion.value) {
      url += `?region_id=${selectedThirdRegion.value.id}`
    } else if (selectedChildRegion.value) {
      url += `?region_id=${selectedChildRegion.value.id}`
    } else {
      url += `?region_id=${selectedRegion.value.id}`
    }

    const response =
      await api.fetchData<
        { key: string; modal: boolean; title: string; value: string; sub?: any[] }[]
      >(url)
    if (response.data) {
      regionDetails.value = response.data
      dashboardLanguages.value = response.data[4].sub ? response.data[4].sub : []
      popularBooks.value = response.data[9].sub ? response.data[9].sub : []
      bookTypes.value = response.data[5].sub ? response.data[5].sub : []
      ratings.value = response.data[11].sub ? response.data[11].sub : []

      if (response.data[10].sub) {
        response.data[10].sub.forEach((item) => {
          let parts = item.value.split('/')
          const value = {
            title: item.title,
            request: parts[0],
            return: parts[1]
          }
          organizations.value.push(value)
        })
      }

      ministryStatistics.value[0].title = Number(response.data[0].value)
      ministryStatistics.value[1].title = Number(response.data[1].value)
      ministryStatistics.value[2].title = Number(response.data[2].value)
      ministryStatistics.value[3].title = Number(response.data[7].value)
      ministryStatistics.value[4].title = Number(response.data[8].value.split('/')[0])
      ministryStatistics.value[5].title = Number(response.data[6].value)

      const bookSchoolData = response.data[3].value.split('/')
      bookSchools.value.amount = parseInt(bookSchoolData[0])
      bookSchools.value.books = parseInt(bookSchoolData[1])

      regionDetailsLoaded.value = true
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

interface Region {
  id: number
  parent_id: number | null
  number: string
  title: string
  region_type: { id: number; title: string }
}

const selectedRegion: Ref<Region | null> = ref(null)
const regions: Ref<Region[]> = ref([])

const selectedChildRegion: Ref<Region | null> = ref(null)
const childRegions: Ref<Region[]> = ref([])

const selectedThirdRegion: Ref<Region | null> = ref(null)
const thirdRegions: Ref<Region[]> = ref([])

const getRegions = async () => {
  try {
    let url = '/v1/region'
    if (selectedChildRegion.value) url += `?parent_id=${selectedChildRegion.value.id}`
    else if (selectedRegion.value) url += `?parent_id=${selectedRegion.value.id}`

    const response = await api.fetchData<{ data: { items: Region[] } }>(url)
    if (response.data) {
      if (regions.value.length === 0) regions.value = response.data.data.items
      else if (childRegions.value.length === 0) childRegions.value = response.data.data.items
      else thirdRegions.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const schools: Ref<any[]> = ref([])
const schoolPage = ref(1)
const schoolLength = ref(1)
const schoolSearch = ref('')
const getSchools = async (search: string | null = null) => {
  try {
    let request = `/v1/school?page=${schoolPage.value}`
    if (search) {
      request += `&search=${search}`
    }
    if (selectedThirdRegion.value) request += `&region_id=${selectedThirdRegion.value.id}`
    else if (selectedChildRegion.value) request += `&region_id=${selectedChildRegion.value.id}`
    else if (selectedRegion.value) request += `&region_id=${selectedRegion.value.id}`
    const response = await api.fetchData<{ data: { items: any[] }; meta: { last_page: number } }>(
      request
    )
    if (response.data) {
      schools.value = response.data.data.items
      schoolLength.value = response.data.meta.last_page
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

watch(schoolPage, () => {
  if (schoolSearch.value.length > 0) {
    getSchools(schoolSearch.value)
  } else {
    getSchools()
  }
})

watch(schoolSearch, (value) => {
  if (value.length > 0) {
    getSchools(value)
  } else {
    getSchools()
  }
})

const regionDetailsLoaded: Ref<boolean> = ref(false)

const getDashboard = async () => {
  try {
    const response = await api.fetchData<{
      books: { base: number; fund: number; items: number; amount: number; decommissioned: number }
    }>('/v1/dashboard')
    if (response.data) {
      librarianStatistics.value[0].title = response.data.books['base']
      librarianStatistics.value[1].title = response.data.books['fund']
      librarianStatistics.value[2].title = response.data.books['items']
      librarianStatistics.value[3].title = response.data.books['amount']
      librarianStatistics.value[4].title = response.data.books['decommissioned']
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const subscriptions: Ref<any[]> = ref([])
const searchItems: Ref<any[]> = ref([])
const searchSubscription: Ref<string | null> = ref(null)
const userId = ref('')

const searchSubscriptions = async (search: string = '') => {
  let url = `/v1/subscription?search=${search}`
  const response = await api.fetchData<{ data: { items: any[] } }>(url)
  if (response.data) searchItems.value = response.data.data.items
}
const getSubscriptions = async () => {
  let url = '/v1/subscription'
  if (searchSubscription.value && searchSubscription.value.length > 0)
    url += `?search=${searchSubscription.value}`
  const response = await api.fetchData<{ data: { items: any[] } }>(url)
  if (response.data) subscriptions.value = response.data.data.items
}

const drawer: Ref<boolean> = ref(false)

const autocompleteRef = ref(null)
const selectItem = (item: any) => {
  searchSubscription.value =
    item.user.user_data.lastname +
    ' ' +
    item.user.user_data.firstname +
    ' ' +
    item.user.user_data.fathername
      ? item.user.user_data.fathername
      : ''
  userId.value = item.user_id
  autocompleteRef.value.blur()
}

const startRequest = async (item: any) => {
  drawer.value = true
  searchSubscription.value =
    item.user.user_data.lastname +
    ' ' +
    item.user.user_data.firstname +
    ' ' +
    item.user.user_data.fathername
      ? item.user.user_data.fathername
      : ''
}

const inventory = ref([])
const selectedInventory = ref(null)
const selectedUnit = ref(null)
const returnDate = ref(null)
const bookStates: Ref<any[]> = ref([])
const showAdditionalData = ref(false)

const getBookStates = async () => {
  try {
    const response = await api.fetchData<{ data: { items: any[] } }>('/v1/book/state')
    if (response.data) bookStates.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const quarter = ref(null)
const requestAmount = ref(0)

const getInventory = async () => {
  try {
    const response = await api.fetchData('/v1/book/school?book_inventory=1')
    if (response.data) {
      inventory.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const closeDrawer = () => {
  searchSubscription.value = ''
  drawer.value = false
}

function formatDate(dateToFormat: string) {
  const date = new Date(dateToFormat)
  const day = date.getDate().toString().length > 1 ? date.getDate() : '0' + date.getDate()
  const month =
    (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : '0' + date.getMonth()
  return `${day}.${month}.${date.getFullYear()}`
}

const errorText = ref('')
const snackbar = ref(false)

const createRequest = async () => {
  try {
    const requestBody = {
      user_id: userId.value,
      book_school_id: selectedInventory.value.id,
      book_inventory_id: selectedUnit.value.id,
      return_date: formatDate(returnDate.value)
    }

    if (requestAmount.value && requestAmount.value > 0) {
      requestBody['amount'] = requestAmount.value
    }

    if (quarter.value) {
      requestBody['quarter'] = quarter.value
    }

    await api.postData('/v1/subscription/request', requestBody)
  } catch (e) {
    snackbar.value = true
    errorText.value = String(e)
  }

  searchSubscription.value = ''
  selectedInventory.value = null
  selectedUnit.value = null
  returnDate.value = null
  requestAmount.value = null
  quarter.value = null

  drawer.value = false
}

if (role.value === 8 || role.value === 1) {
  getBookPurchase()
  getRequests()
  getSchools()
  getRegions()
  getDashboard()
}

watch(selectedRegion, () => {
  getRegions()
  getSchools()
  getRegionDetails()
})

watch(selectedChildRegion, () => {
  getRegions()
  getSchools()
  getRegionDetails()
})

watch(selectedThirdRegion, () => {
  getSchools()
  getRegionDetails()
})

if (role.value === 3) {
  getDashboard()
}
getBookStates()
getBookState()
getPublishers()
getUserAges()
getSubscriptions()
getInventory()
</script>

<template>
  <main>
    <v-container :fluid="role === 8 || role === 1">
      <v-snackbar
        v-model="snackbar"
        :text="errorText"
        :timeout="10000"
        color="primary"
      ></v-snackbar>
      <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
        <v-list-item>
          <span class="font-weight-bold">Выдача книги</span>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item>
          <v-autocomplete
            v-model="selectedInventory"
            :items="inventory"
            class="mt-4"
            item-title="book.title"
            label="Книга"
            return-object
            variant="outlined"
          ></v-autocomplete>
        </v-list-item>
        <v-list-item>
          <v-autocomplete
            v-model="selectedUnit"
            :disabled="!selectedInventory"
            :items="selectedInventory ? selectedInventory.book_inventory : []"
            class="mt-2"
            item-title="inventory"
            label="Инвентарь"
            return-object
            variant="outlined"
          ></v-autocomplete>
        </v-list-item>
        <v-list-item>
          <v-text-field
            v-model="returnDate"
            class="mt-4"
            label="Дата возврата"
            type="date"
            variant="outlined"
          ></v-text-field>
        </v-list-item>
        <v-list-item>
          <v-btn
            :append-icon="showAdditionalData ? 'mdi-minus' : 'mdi-plus'"
            class="mt-2"
            color="primary"
            variant="text"
            @click="showAdditionalData = !showAdditionalData"
            >Расширенные данные
          </v-btn>
        </v-list-item>
        <v-list-item v-if="showAdditionalData">
          <v-select
            v-model="quarter"
            :items="[
              { value: 1, title: '1 четверть' },
              { value: 2, title: '2 четверть' },
              { value: 3, title: '3 четверть' },
              { value: 4, title: '4 четверть' },
              { value: 5, title: 'Мероприятия' },
              { value: 6, title: 'Открытый урок' }
            ]"
            class="mt-4"
            clearable
            label="Четверть (необязательно)"
            variant="outlined"
          >
          </v-select>
        </v-list-item>
        <v-list-item v-if="showAdditionalData">
          <v-text-field
            v-model="requestAmount"
            class="mt-2"
            label="Количество (необязательно)"
            type="number"
            variant="outlined"
          ></v-text-field>
        </v-list-item>
        <v-list-item class="mt-3">
          <v-btn class="mr-3" variant="tonal" @click="closeDrawer">Закрыть</v-btn>
          <v-btn color="primary" variant="flat" @click="createRequest">Выдача</v-btn>
        </v-list-item>
      </v-navigation-drawer>

      <v-row>
        <v-col>
          <div class="text-h5 font-weight-bold">Приборная доска</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-banner v-if="role !== 8" bg-color="light-blue" rounded>
            <template v-slot:prepend>
              <v-avatar color="white" icon="mdi-hand-wave"></v-avatar>
            </template>

            <v-banner-text>
              <div class="text-h6">
                Добро пожаловать, {{ auth.user.value ? auth.user.value.user_data.firstname : '' }}
              </div>
            </v-banner-text>
          </v-banner>
          <v-banner v-else bg-color="white" rounded>
            <v-row>
              <v-col>
                <div class="text-h6">
                  Добро пожаловать, {{ auth.user.value ? auth.user.value.user_data.firstname : '' }}
                </div>
              </v-col>
              <v-col>
                <div class="w-100 d-flex justify-center">
                  <v-dialog max-width="80vw">
                    <template v-slot:activator="{ props }">
                      <v-btn size="small" v-bind="props" variant="tonal">Запросы</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Запросы">
                        <v-data-table
                          :headers="[
                            { key: 'id', title: 'ID' },
                            { key: 'school.title', title: 'Название' },
                            { key: 'school.bin', title: 'БИН' },
                            { key: 'school.address', title: 'Адрес' },
                            { key: 'user', title: 'Запрос и наименования книг' }
                          ]"
                          :items="requests"
                        >
                          <template v-slot:[`item.user`]="{ item }">
                            <div class="d-flex flex-row align-center justify-space-between">
                              <div class="d-flex flex-column">
                                <span>{{ item.user.fullname }}</span>
                                <span>{{ item.user.email }}</span>
                                <span>{{ item.user.phone }}</span>
                              </div>
                              <v-btn color="warning" disabled size="x-small" variant="flat"
                                >Запрос для фонда {{ item.amount }}
                              </v-btn>
                            </div>
                          </template>

                          <template v-slot:bottom></template>
                        </v-data-table>
                      </v-card>
                    </template>
                  </v-dialog>

                  <v-dialog max-width="80vw">
                    <template v-slot:activator="{ props }">
                      <v-btn class="mx-3" size="small" v-bind="props" variant="tonal"
                        >Список книг
                      </v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Список книг">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              { key: 'id', title: 'ID' },
                              { key: 'book', title: 'Наименование (Описание/Язык)' },
                              { key: 'info', title: 'Автор(ы)/Жанр' },
                              { key: 'year', title: 'Год издания' },
                              { key: 'publisherType', title: 'Издательство/Тип' }
                            ]"
                            :items="purchases"
                          >
                            <template v-slot:[`item.book`]="{ item }">
                              <div class="font-weight-bold mt-2">{{ item.title }}</div>
                              <div class="my-2">{{ item.description }}</div>
                              <div class="mb-2">
                                <v-chip size="small">{{ item.language.title }}</v-chip>
                              </div>
                            </template>

                            <template v-slot:[`item.info`]="{ item }">
                              <div>
                                <v-chip
                                  v-for="author in item.authors_main"
                                  :key="author.id"
                                  color="primary"
                                  variant="outlined"
                                >
                                  {{ author.name }}
                                </v-chip>
                              </div>
                              <div class="mt-2">
                                <v-chip
                                  v-for="genre in item.genres"
                                  :key="genre.id"
                                  color="red"
                                  size="small"
                                  variant="flat"
                                >
                                  {{ genre.title }}
                                </v-chip>
                              </div>
                            </template>

                            <template v-slot:[`item.publisherType`]="{ item }">
                              <div>{{ item.publisher.title }}</div>
                              <div class="mt-2">
                                <v-chip color="red" size="small" variant="flat"
                                  >{{ item.type.title }}
                                </v-chip>
                              </div>
                            </template>

                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>

                  <v-dialog max-width="80vw">
                    <template v-slot:activator="{ props }">
                      <v-btn size="small" v-bind="props" variant="tonal"
                        >Добавить книгу в список
                      </v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Добавление книги">
                        <v-data-table>
                          <template v-slot:bottom></template>
                        </v-data-table>
                      </v-card>
                    </template>
                  </v-dialog>
                </div>
              </v-col>
              <v-col>
                <v-btn size="small" variant="outlined" @click="downloadSpros"
                  >Читательский спрос
                </v-btn>
                <v-btn
                  class="ml-3"
                  color="primary"
                  size="small"
                  variant="flat"
                  @click="downloadReport"
                  >Скачать отчет за 2024 год
                </v-btn>
              </v-col>
            </v-row>
          </v-banner>
        </v-col>
      </v-row>

      <v-card v-if="role === 8 || role === 1" class="my-4">
        <v-card-text>
          <v-row>
            <v-col cols="4">
              <v-select
                v-model="selectedRegion"
                :items="regions"
                label="Выберите регион"
                return-object
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-if="selectedRegion"
                v-model="selectedChildRegion"
                :items="childRegions"
                label="Выберите регион"
                return-object
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="4">
              <v-select
                v-if="selectedChildRegion"
                v-model="selectedThirdRegion"
                :items="thirdRegions"
                label="Выберите регион"
                return-object
                variant="outlined"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-row v-if="(role === 8 || role === 1) && regionDetailsLoaded">
        <v-col cols="3">
          <StatisticsList :statistics="statistics"></StatisticsList>
        </v-col>
        <v-col cols="9">
          <v-row>
            <v-col cols="7">
              <v-card title="Количество книг в фонде">
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <Pie :data="pieChartData" :options="options"></Pie>
                    </v-col>
                    <v-col cols="6">
                      <div class="d-flex flex-column">
                        <div class="font-weight-bold">Экземпляров: {{ bookSchools.amount }}</div>
                        <v-progress-linear
                          :model-value="bookSchools.amount"
                          color="#0095FF"
                        ></v-progress-linear>
                        <div class="mt-4 font-weight-bold">
                          Наименований: {{ bookSchools.books }}
                        </div>
                        <v-progress-linear
                          :model-value="bookSchools.books"
                          color="#00E096"
                        ></v-progress-linear>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="5">
              <v-card title="Количество экземпляров по языкам">
                <v-card-text>
                  <v-data-table
                    :headers="[
                      {
                        key: 'title',
                        title: 'Язык'
                      },
                      { key: 'value', title: 'Экз./наим.' }
                    ]"
                    :items="dashboardLanguages"
                    items-per-page="3"
                  >
                    <template v-slot:bottom></template>
                  </v-data-table>
                </v-card-text>
                <v-card-actions>
                  <v-dialog max-width="70vw">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" v-bind="props" variant="flat">Подробнее</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Количество экземпляров по языкам">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              {
                                key: 'title',
                                title: 'Язык'
                              },
                              { key: 'value', title: 'Экз./наим.' }
                            ]"
                            :items="dashboardLanguages"
                            items-per-page="50"
                          >
                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4">
              <v-card title="Наименования по типу книг">
                <v-card-text>
                  <v-data-table
                    :headers="[
                      {
                        key: 'title',
                        title: 'Тип книги'
                      },
                      { key: 'value', title: 'Количество' }
                    ]"
                    :items="bookTypes"
                    items-per-page="3"
                  >
                    <template v-slot:bottom></template>
                  </v-data-table>
                </v-card-text>
                <v-card-actions color="primary" variant="flat">
                  <v-dialog max-width="70vw">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" v-bind="props" variant="flat">Подробнее</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Наименования по типу книг">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              {
                                key: 'title',
                                title: 'Тип книги'
                              },
                              { key: 'value', title: 'Количество' }
                            ]"
                            :items="bookTypes"
                            items-per-page="50"
                          >
                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="8">
              <v-card title="Популярные книги">
                <v-card-text>
                  <v-data-table
                    :headers="[
                      {
                        key: 'title',
                        title: 'Название'
                      },
                      { key: 'value', title: 'Количество' }
                    ]"
                    :items="popularBooks"
                    items-per-page="3"
                  >
                    <template v-slot:bottom></template>
                  </v-data-table>
                </v-card-text>
                <v-card-actions>
                  <v-dialog max-width="70vw">
                    <template v-slot:activator="{ props }">
                      <v-btn color="primary" v-bind="props" variant="flat">Подробнее</v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card title="Популярные книги">
                        <v-card-text>
                          <v-data-table
                            :headers="[
                              {
                                key: 'title',
                                title: 'Название'
                              },
                              { key: 'value', title: 'Количество' }
                            ]"
                            :items="popularBooks"
                            items-per-page="50"
                          >
                            <template v-slot:bottom></template>
                          </v-data-table>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-row v-if="(role === 8 || role === 1) && regionDetailsLoaded">
        <v-col>
          <v-card title="Организации по выдаче">
            <v-card-text>
              <v-data-table
                :headers="[
                  {
                    key: 'title',
                    title: 'Организация'
                  },
                  { key: 'request', title: 'Выдача' },
                  { key: 'return', title: 'Возврат' }
                ]"
                :items="organizations"
                items-per-page="3"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-dialog max-width="70vw">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props" variant="flat">Подробнее</v-btn>
                </template>

                <template v-slot:default>
                  <v-card title="Организации по выдаче">
                    <v-card-text>
                      <v-data-table
                        :headers="[
                          {
                            key: 'title',
                            title: 'Организация'
                          },
                          { key: 'request', title: 'Выдача' },
                          { key: 'return', title: 'Возврат' }
                        ]"
                        :items="organizations"
                        items-per-page="50"
                      >
                        <template v-slot:bottom></template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </template>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col>
          <v-card title="Списанные книги по рейтингу">
            <v-card-text>
              <v-data-table
                :headers="[
                  {
                    key: 'title',
                    title: 'Название'
                  },
                  { key: 'value', title: 'Количество' }
                ]"
                :items="ratings"
                items-per-page="3"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-dialog max-width="70vw">
                <template v-slot:activator="{ props }">
                  <v-btn color="primary" v-bind="props" variant="flat">Подробнее</v-btn>
                </template>

                <template v-slot:default>
                  <v-card title="Списанные книги по рейтингу">
                    <v-card-text>
                      <v-data-table
                        :headers="[
                          {
                            key: 'title',
                            title: 'Название'
                          },
                          { key: 'value', title: 'Количество' }
                        ]"
                        :items="ratings"
                        items-per-page="50"
                      >
                        <template v-slot:bottom></template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </template>
              </v-dialog>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role !== 8 && role !== 1">
        <v-col cols="3">
          <StatisticsList :statistics="statistics"></StatisticsList>
        </v-col>
        <v-col v-if="role === 3" cols="6">
          <v-card>
            <v-card-title>Статистика по выдачам и возвратам книг</v-card-title>
            <v-card-subtitle>Легко отслеживай статистику</v-card-subtitle>

            <v-card-text>
              <v-container fluid>
                <v-row>
                  <v-col>
                    <Doughnut :data="doughnut" :options="options"></Doughnut>
                  </v-col>
                  <v-col>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>
                          <strong>Показатели</strong>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Годовой</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Годовой</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Выдача</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="role === 3" cols="3">
          <v-card>
            <v-card-title>Выдача и возврат</v-card-title>
            <v-card-subtitle>Быстрый поиск по ИИН</v-card-subtitle>

            <v-card-text>
              <v-autocomplete
                ref="autocompleteRef"
                v-model="searchSubscription"
                :items="searchItems"
                label="Напишите ИИН"
                no-filter
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                @update:search="searchSubscriptions"
              >
                <template v-slot:no-data></template>
                <template v-slot:item="{ item }">
                  <v-list-item @click="selectItem(item.value)">
                    <div class="d-flex align-center justify-space-between">
                      <span>
                        {{ item.value.user.user_data.lastname }}
                        {{ item.value.user.user_data.firstname }}
                        {{ item.value.user.user_data.familyname }}
                      </span>

                      <v-btn
                        append-icon="mdi-plus"
                        color="primary"
                        size="small"
                        variant="flat"
                        @click="startRequest(item.value)"
                        >Выдача
                      </v-btn>
                    </div>
                  </v-list-item>
                </template>
              </v-autocomplete>
              <v-data-table
                :headers="[
                  { title: 'ФИО', key: 'name' },
                  { title: 'Количество', key: 'amount' }
                ]"
                :items="subscriptions"
                items-per-page="5"
              >
                <template v-slot:[`item.name`]="{ item }">
                  <small>
                    {{ item.user.user_data.lastname }} {{ item.user.user_data.firstname }}
                    {{ item.user.user_data.fathername }}
                  </small>
                </template>
                <template v-slot:[`item.amount`]="{ item }">
                  <small>
                    {{
                      parseInt(item.subscriptions.requests) + parseInt(item.subscriptions.returns)
                    }}
                  </small>
                </template>
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col v-if="role === 4">
          <v-card title="Список">
            <v-card-text>
              <v-data-table :headers="classroomHeaders" :items="classroomItems">
                <template v-slot:[`item.actions`]="{}">
                  <v-btn append-icon="mdi-chevron-right" color="primary" variant="text"
                    >Подробнее
                  </v-btn>
                </template>
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col v-if="role === 4" cols="3">
          <v-card>
            <v-card-title>Заявки на класс</v-card-title>
            <v-card-subtitle>Выдача на класс</v-card-subtitle>

            <v-card-text>
              <v-autocomplete label="Для кого" variant="outlined"></v-autocomplete>
              <v-autocomplete
                label="Книга"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
              ></v-autocomplete>
              <v-text-field
                label="Дата выдачи"
                prepend-inner-icon="mdi-magnify"
                type="date"
                variant="outlined"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="flat">Заявка</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col v-if="role === 7" cols="4">
          <v-card title="Списанные">
            <v-card-text>
              <v-data-table :headers="publisherTableHeaders" :items="publisherTableItems">
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 7">
        <v-col>
          <v-card title="По регионам">
            <v-card-text>
              <v-data-table
                :headers="[
                  { key: 'title', title: 'Название' },
                  { key: 'count', title: 'Наименование книг' },
                  { key: 'amount', title: 'Экземпляры книг' },
                  { key: 'actions' }
                ]"
                :items="[
                  { title: 'Алматы', count: 234, amount: 7523 },
                  { title: 'Астана', count: 53, amount: 1035 },
                  { title: 'Шымкент', count: 0, amount: 0 },
                  { title: 'ВКО', count: 0, amount: 0 },
                  { title: 'СКО', count: 9, amount: 324 },
                  { title: 'Актау', count: 0, amount: 0 }
                ]"
              >
                <template v-slot:[`item.actions`]>
                  <v-btn append-icon="mdi-chevron-right" color="primary" variant="text"
                    >Подробнее
                  </v-btn>
                </template>
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat" @click="downloadPublisher">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col>
          <v-card title="Соотношение по выдачу и возрату">
            <v-card-text>
              <v-data-table
                :headers="[
                  { key: 'title', title: 'Название' },
                  { key: 'requests', title: 'На выдаче' },
                  { key: 'returns', title: 'Читательный зал' }
                ]"
                :items="[
                  { title: 'Школа 1', requests: 25, returns: 100 },
                  { title: 'Школа 2', requests: 25, returns: 100 },
                  { title: 'Школа 3', requests: 25, returns: 100 },
                  { title: 'Школа 4', requests: 25, returns: 100 },
                  { title: 'Школа 5', requests: 25, returns: 100 },
                  { title: 'Школа 6', requests: 25, returns: 100 }
                ]"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 7">
        <v-col>
          <v-card title="Выдача и возврат">
            <v-card-text>
              <PublisherTable></PublisherTable>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 3">
        <v-col cols="3">
          <CountryModal></CountryModal>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title>Читатели по возрасту</v-card-title>

            <v-card-text>
              <Pie :data="agesChartData" :options="options" />
            </v-card-text>

            <v-card-actions>
              <AgesModal></AgesModal>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card>
            <v-card-title> Классы по количеству читателей</v-card-title>

            <v-card-text>
              <v-data-table :headers="headers" :items="readers" hide-footer>
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <ClassModalVue></ClassModalVue>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-if="role === 3">
        <v-col>
          <v-card>
            <v-card-title>Состояние по фонду книг</v-card-title>

            <v-card-text>
              <v-data-table :headers="fundHeaders" :items="fund ? fund : []" :loading="fundLoading">
                <template v-slot:bottom></template>

                <template v-slot:[`item.actions`]="{ item }">
                  <v-btn color="primary" variant="text" @click="downloadPDF(item.id)">
                    Подробнее
                    <template v-slot:append>
                      <v-icon color="primary" icon="mdi-chevron-right"></v-icon>
                    </template>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <FundModalVue></FundModalVue>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col>
          <v-card>
            <v-card-title>Издательства</v-card-title>

            <v-card-text>
              <v-data-table
                :headers="publisherHeaders"
                :items="publishers ? publishers : []"
                :loading="publishersLoading"
              >
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <PublishersModal></PublishersModal>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 4">
        <v-col>
          <v-card>
            <v-card-title>История заявок</v-card-title>
            <v-card-text>
              <HistoryTable></HistoryTable>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="flat">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 3 || role === 7">
        <v-col>
          <v-card>
            <v-card-title>Выдача и возврат</v-card-title>

            <v-card-text>
              <SubscriptionTable></SubscriptionTable>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" variant="flat">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 8 || role === 1">
        <v-col cols="12">
          <v-card>
            <v-card-text>
              <v-data-table
                :headers="[
                  { key: 'id', title: 'ID' },
                  { key: 'name', title: 'Название' },
                  { key: 'description.bin', title: 'БИН' },
                  { key: 'description.address', title: 'Адрес' },
                  { key: 'organization.label', title: 'Тип организации' },
                  { key: 'report', title: 'Отчет' },
                  { key: 'actions', title: '' }
                ]"
                :items="schools"
              >
                <template v-slot:[`item.report`]>
                  <v-btn
                    class="rounded"
                    color="primary"
                    prepend-icon="mdi-download"
                    variant="flat"
                    @click="downloadMinistryReport"
                  >
                    Скачать
                  </v-btn>
                </template>
                <template v-slot:[`item.actions`]>
                  <v-dialog max-width="90vw">
                    <template v-slot:activator="{ props }">
                      <v-btn prepend-icon="mdi-arrow-right" v-bind="props" variant="outlined"
                        >Перейти
                      </v-btn>
                    </template>

                    <template v-slot:default>
                      <v-card>
                        <v-card-text>
                          <v-tabs v-model="tab" color="primary">
                            <v-tab :value="1">Данные по библиотеке</v-tab>
                            <v-tab :value="2">Данные поступлениям</v-tab>
                          </v-tabs>
                          <v-window v-model="tab">
                            <v-window-item :value="1">
                              <v-container fluid>
                                <v-row>
                                  <v-col cols="3">
                                    <StatisticsList
                                      :statistics="librarianStatistics"
                                      class="border"
                                    ></StatisticsList>
                                  </v-col>
                                  <v-col cols="6">
                                    <v-card class="border">
                                      <v-card-title
                                        >Статистика по выдачам и возвратам книг
                                      </v-card-title>
                                      <v-card-subtitle>Легко отслеживай статистику</v-card-subtitle>

                                      <v-card-text>
                                        <v-container fluid>
                                          <v-row>
                                            <v-col>
                                              <Doughnut
                                                :data="doughnut"
                                                :options="options"
                                              ></Doughnut>
                                            </v-col>
                                            <v-col>
                                              <v-list>
                                                <v-list-item>
                                                  <v-list-item-title>
                                                    <strong>Показатели</strong>
                                                  </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item>
                                                  <v-list-item-title>
                                                    <div class="d-flex flex-column">
                                                      <strong>Годовой</strong>
                                                    </div>
                                                  </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item>
                                                  <v-list-item-title>
                                                    <div class="d-flex flex-column">
                                                      <strong>Годовой</strong>
                                                    </div>
                                                  </v-list-item-title>
                                                </v-list-item>
                                                <v-list-item>
                                                  <v-list-item-title>
                                                    <div class="d-flex flex-column">
                                                      <strong>Выдача</strong>
                                                    </div>
                                                  </v-list-item-title>
                                                </v-list-item>
                                              </v-list>
                                            </v-col>
                                          </v-row>
                                        </v-container>
                                      </v-card-text>
                                    </v-card>
                                  </v-col>
                                </v-row>

                                <v-row>
                                  <v-col cols="3">
                                    <v-card class="border">
                                      <v-card-title>Книги по странам</v-card-title>
                                      <v-card-text>
                                        <v-list>
                                          <v-list-item
                                            v-for="country in countries"
                                            :key="country.id"
                                          >
                                            <v-list-item-title>
                                              <div class="d-flex">
                                                <div class="w-25 mr-2 text-center">
                                                  <v-img
                                                    :src="country.flag"
                                                    class="rounded"
                                                  ></v-img>
                                                </div>
                                                <div class="w-75">
                                                  {{ country.name }}

                                                  <v-progress-linear
                                                    v-model="country.progress"
                                                    color="primary"
                                                  >
                                                  </v-progress-linear>

                                                  <span class="font-weight-bold">
                                                    {{ country.progress }} %</span
                                                  >
                                                </div>
                                              </div>
                                            </v-list-item-title>

                                            <v-list-item-subtitle></v-list-item-subtitle>
                                          </v-list-item>
                                        </v-list>
                                      </v-card-text>
                                      <v-card-actions>
                                        <CountryModal class="border"></CountryModal>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                  <v-col>
                                    <v-card>
                                      <v-card-title>Читатели по возрасту</v-card-title>

                                      <v-card-text>
                                        <Pie :data="agesChartData" :options="options" />
                                      </v-card-text>

                                      <v-card-actions>
                                        <AgesModal></AgesModal>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                  <v-col cols="4">
                                    <v-card class="border">
                                      <v-card-title> Классы по количеству читателей</v-card-title>

                                      <v-card-text>
                                        <v-data-table
                                          :headers="headers"
                                          :items="readers"
                                          hide-footer
                                        >
                                          <template v-slot:bottom></template>
                                        </v-data-table>
                                      </v-card-text>

                                      <v-card-actions>
                                        <ClassModalVue></ClassModalVue>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col>
                                    <v-card class="border">
                                      <v-card-title>Состояние по фонду книг</v-card-title>

                                      <v-card-text>
                                        <v-data-table
                                          :headers="fundHeaders"
                                          :items="fund ? fund : []"
                                          :loading="fundLoading"
                                        >
                                          <template v-slot:bottom></template>

                                          <template v-slot:[`item.actions`]="{}">
                                            <v-btn
                                              color="primary"
                                              variant="text"
                                              @click="downloadPDF()"
                                            >
                                              Подробнее
                                              <template v-slot:append>
                                                <v-icon
                                                  color="primary"
                                                  icon="mdi-chevron-right"
                                                ></v-icon>
                                              </template>
                                            </v-btn>
                                          </template>
                                        </v-data-table>
                                      </v-card-text>

                                      <v-card-actions>
                                        <FundModalVue></FundModalVue>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>

                                  <v-col>
                                    <v-card>
                                      <v-card-title>Издательства</v-card-title>

                                      <v-card-text>
                                        <v-data-table
                                          :headers="publisherHeaders"
                                          :items="publishers ? publishers : []"
                                          :loading="publishersLoading"
                                        >
                                          <template v-slot:bottom></template>
                                        </v-data-table>
                                      </v-card-text>

                                      <v-card-actions>
                                        <PublishersModal></PublishersModal>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col>
                                    <v-card class="border">
                                      <v-card-title>Выдача и возврат</v-card-title>

                                      <v-card-text>
                                        <SubscriptionTable></SubscriptionTable>
                                      </v-card-text>

                                      <v-card-actions>
                                        <v-btn color="primary" variant="flat">Подробнее</v-btn>
                                      </v-card-actions>
                                    </v-card>
                                  </v-col>
                                </v-row>
                              </v-container>
                            </v-window-item>
                            <v-window-item :value="2">
                              <v-container fluid>
                                <v-row>
                                  <v-col cols="12">
                                    <v-card class="border">
                                      <v-row>
                                        <v-col cols="6">
                                          <div class="my-2 ml-3 d-flex justify-space-between">
                                            <div class="d-flex flex-column">
                                              <strong>42</strong>
                                              <span class="text-medium-emphasis"
                                                >Название книги</span
                                              >
                                            </div>
                                            <div class="d-flex flex-column">
                                              <strong>300</strong>
                                              <span class="text-medium-emphasis"
                                                >Количество книг</span
                                              >
                                            </div>
                                            <div class="d-flex flex-column">
                                              <strong>300 000 000</strong>
                                              <span class="text-medium-emphasis"
                                                >Сумма поступления книг</span
                                              >
                                            </div>
                                          </div>
                                        </v-col>
                                        <v-col cols="6"></v-col>
                                      </v-row>
                                    </v-card>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col cols="12">
                                    <v-card class="border">
                                      <v-data-table
                                        :headers="[
                                          { key: 'title', title: 'Название' },
                                          { key: 'author', title: 'Автор' },
                                          { key: 'year', title: 'Год издания' },
                                          { key: 'admissionDate', title: 'Дата поступления' },
                                          { key: 'price', title: 'Цена' },
                                          { key: 'amount', title: 'Количество' }
                                        ]"
                                        :items="[
                                          {
                                            title: 'Қазақтың салт-дәстүрлері мен әдет-ғұрыптары',
                                            author: 'Сейіт Кенжеахметұлы',
                                            year: '2013',
                                            admissionDate: '2013-04-06 ',
                                            price: '2781',
                                            amount: '1'
                                          },
                                          {
                                            title: 'Қазақтың салт-дәстүрлері мен әдет-ғұрыптары',
                                            author: 'Сейіт Кенжеахметұлы',
                                            year: '2013',
                                            admissionDate: '2013-04-06 ',
                                            price: '2781',
                                            amount: '1'
                                          }
                                        ]"
                                      >
                                        <template v-slot:bottom></template>
                                      </v-data-table>
                                    </v-card>
                                  </v-col>
                                </v-row>
                              </v-container>
                            </v-window-item>
                          </v-window>
                        </v-card-text>
                      </v-card>
                    </template>
                  </v-dialog>
                </template>
                <template v-slot:bottom></template>

                <template v-slot:top>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="schoolSearch"
                        label="Поиск по БИН"
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="role === 8 || role === 1">
        <v-col>
          <v-pagination
            v-model="schoolPage"
            :length="schoolLength"
            :total-visible="6"
            active-color="primary"
            class="ml-auto mr-2"
            size="small"
            variant="flat"
          ></v-pagination>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>
