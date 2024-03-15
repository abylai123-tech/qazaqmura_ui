<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue'

interface Inventory {
  amount: any
  id: number
  book: {
    year: number
    title: string
    book_author_main: { id: string; title: string; name: string }[]
  }
  price: number
  book_school_id: number
  book_inventory: any[]
  admission_at: string
}

const bottomItems = [
  { label: 'Инвентаризованные книги', value: 420 },
  { label: 'Списанные книги', value: 300 },
  { label: 'Не инвентаризованные', value: 3 }
]

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Книга', key: 'book' },
  { title: 'Поступление', key: 'admission' },
  { title: 'Инвент', key: 'invent' },
  { title: '', key: 'actions', sortable: false }
]

interface SearchItem {
  amount: number
  author_main: { id: number; name: string }
  book_school_id: number
  title: string
}

const inventorySearch: Ref<SearchItem[]> = ref([])
const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(0)
const items: Ref<Inventory[]> = ref([])
const search: Ref<string | null> = ref(null)
const drawer: Ref<boolean> = ref(false)
const book: Ref<Inventory | null> = ref(null)
const inventories: Ref<Number[]> = ref([])

const api = useAPI()

async function getContractors() {
  loading.value = true
  try {
    const request = `https://test.api.qazaqmura.kz/v1/book/school?book_inventory=1&page=${page.value}`
    const response = await api.fetchData<{
      data: { items: Inventory[] }
      meta: { last_page: number }
    }>(request)
    if (response.data) {
      items.value = response.data.data.items
      length.value = response.data.meta.last_page
      loading.value = false
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function addToInventory(inventories: Number[]) {
  const bookSchoolId = book.value ? book.value.book_school_id : null
  try {
    const response = await api.postData('https://test.api.qazaqmura.kz/v1/book/inventory', {
      book_school_id: bookSchoolId,
      inventories: inventories
    })
    console.log('Response:', response.data)
  } catch (error) {
    console.error('Error:', error)
  }
  closeInventory()
}

async function getInventorySearch(search: string | null = null) {
  const request = search
    ? `https://test.api.qazaqmura.kz/v1/book/school/inventory/search?search=${search}`
    : 'https://test.api.qazaqmura.kz/v1/book/school/inventory/search'
  try {
    const response = await api.fetchData<SearchItem[]>(request)
    if (response.data) {
      inventorySearch.value = response.data
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

function closeInventory() {
  book.value = null
  drawer.value = false
}

function downloadPDF() {
  const link = document.createElement('a')
  link.href = inventory
  link.download = 'document.pdf'
  link.click()
  document.body.removeChild(link)
}

getContractors()
getInventorySearch()

watch(book, (value) => {
  if (value) {
    inventories.value = []
    const length = value.amount - value.book_inventory.length
    inventories.value = new Array(length).fill(undefined)
  }
})

watch(page, () => {
  getContractors()
})
watch(search, () => {
  getContractors()
})
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="400">
      <v-list-item>
        <span class="font-weight-bold">Инвентаризация книги</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-autocomplete
          v-model="book"
          :items="inventorySearch"
          class="pt-10"
          item-title="title"
          label="Книга"
          placeholder="Напишите название"
          return-object
          variant="outlined"
          @update:search="getInventorySearch"
        ></v-autocomplete>
      </v-list-item>
      <div v-if="book">
        <v-list-item><strong>Инвентарные номера</strong></v-list-item>
        <v-list-item v-for="n in book.amount - book.book_inventory.length" :key="n">
          <v-text-field
            v-model="inventories[n - 1]"
            label="Инвентарный номер"
            placeholder="Напишите номер"
            type="number"
            variant="outlined"
          ></v-text-field>
        </v-list-item>
        <v-list-item>
          <v-btn class="mr-3" variant="tonal" @click="closeInventory">Закрыть</v-btn>
          <v-btn color="primary" variant="flat" @click="addToInventory(inventories)"
            >Добавить
          </v-btn>
        </v-list-item>
      </div>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Инвентарный учет</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >Инвентаризация книг по мере поступления и списания онлайн</span
          >
        </div>
      </template>

      <template v-slot:append>
        <v-btn class="mr-3" prepend-icon="mdi-chevron-down" variant="tonal" @click="downloadPDF"
          >Скачать список как PDF
        </v-btn>
        <v-btn class="mr-3" variant="tonal">Списание</v-btn>
        <v-btn class="mr-3" color="primary" variant="flat" @click="drawer = true"
          >Инвентаризация
        </v-btn>
        <v-btn prepend-icon="mdi-video-outline" variant="tonal">Помощь</v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock
          :bottom-items="bottomItems"
          :mdata="false"
          :one-line="false"
          :users="false"
          inventory
        >
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table :headers="headers" :items="items" class="mt-2" show-select>
      <template v-slot:[`item.book`]="{ item }">
        <div class="mt-3">{{ item.book.title }}</div>
        <div class="text-subtitle-2 text-medium-emphasis">Год издания: {{ item.book.year }}</div>
        <div class="mb-3">
          <v-chip
            v-for="author in item.book.book_author_main"
            :key="author.id"
            color="primary"
            size="x-small"
            variant="outlined"
            >{{ author.name }}
          </v-chip>
        </div>
      </template>

      <template v-slot:[`item.admission`]="{ item }">
        <div class="mt-3">
          <v-chip color="primary" size="x-small" variant="outlined">Новая</v-chip>
        </div>
        <div>Дата: {{ item.admission_at }}</div>
        <div>Цена: {{ item.price }}</div>
      </template>

      <template v-slot:[`item.invent`]="{ item }">
        <div class="mt-3">
          <v-chip color="primary" size="x-small" variant="flat"
            >{{ item.book_inventory.length }}
          </v-chip>
        </div>
        <div class="text-subtitle-2 text-medium-emphasis">
          <v-chip size="x-small" variant="flat"> Статус: в фонде</v-chip>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{}">
        <div class="d-flex justify-center">
          <v-btn append-icon="mdi-arrow-right" variant="outlined">Перейти</v-btn>
        </div>
      </template>

      <template v-slot:bottom></template>
    </v-data-table>

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
