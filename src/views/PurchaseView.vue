<script setup lang="ts">
import { useAPI } from '@/api';
import { ref, type Ref } from 'vue';

interface Item {
  id: number,
  title: string,
  fullname: string,
  date: string,
  amount: number,
  type: { id: number, title: string },
}

const api = useAPI()

const page: Ref<number> = ref(1)
const length: Ref<number> = ref(1)
const loading: Ref<boolean> = ref(false)
const items: Ref<Item[]> = ref([])

const headers = [
  { key: 'id', title: 'ID' },
  { key: 'book', title: 'Книга' },
  { key: 'ordered', title: 'Заказ' },
  { key: 'status', title: 'Статус' },
  { key: 'actions', title: 'Действия' }
]

async function getItems() {
  loading.value = true
  try {
    const response = await api.fetchData<{ meta: { last_page: number }, data: { items: Item[] } }>(`https://test.api.qazaqmura.kz/v1/purchase/book/query?page=${page.value}`)
    if (response.data) {
      length.value = response.data.meta.last_page
      items.value = response.data.data.items
    }
    loading.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}

getItems()
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Заказ книг</span>
          <span class="text-subtitle-2 text-medium-emphasis">Удобный и эффективный способ для заказа необходимых
            книг</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3" prepend-icon="mdi-video-outline">Помощь</v-btn>
        <v-btn variant="flat" color="primary" to="m-data/add" prepend-icon="mdi-plus">Добавить</v-btn>
      </template>
    </v-app-bar>

    <v-data-table :headers="headers" :items="items" :loading="loading">
      <template v-slot:[`item.ordered`]="{ item }">
        <div class="pt-3">
          <v-chip variant="outlined" color="primary">{{ item.amount }} экз.</v-chip>
        </div>
        <div class="py-1">
          <strong>{{ item.fullname }}</strong>
        </div>
        <div class="pb-3">
          <span>Дата подачи: {{ item.date }}</span>
        </div>
      </template>

      <template v-slot:[`item.actions`]>
        <v-btn variant="flat" icon="mdi-pencil"></v-btn>
      </template>

      <template v-slot:bottom></template>
    </v-data-table>

    <v-row class="mt-4">
      <v-pagination class="ml-auto mr-2" :length="length" :total-visible="4" v-model="page" size="small" variant="flat"
        active-color="primary"></v-pagination>
    </v-row>
  </v-container>
</template>