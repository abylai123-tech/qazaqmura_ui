<script setup lang="ts">
import { useAPI } from '@/api';
import { watch } from 'vue';
import { ref, type Ref } from 'vue';
import FilterBlock from '@/components/FilterBlock.vue';

interface Inventory {
  id: number,
  book: {
    book_author_main: { id: string, name: string }[]
  }
}

const bottomItems = [
  { label: 'Инвентаризованные книги', value: 420 },
  { label: 'Списанные книги', value: 300 },
  { label: 'Не инвентаризованные', value: 3 }
]

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название книги', key: 'book.title' },
  { title: 'Автор', key: 'author' },
  { title: 'Год издания', key: 'book.year' },
  { title: 'Цена', key: 'price' },
  { title: '', key: 'actions', sortable: false }
]

const loading: Ref<boolean> = ref(false);
const page: Ref<number> = ref(1);
const length: Ref<number> = ref(0);
const items: Ref<Inventory[]> = ref([]);
const search: Ref<string | null> = ref(null);

const api = useAPI();

async function getContractors() {
  loading.value = true;
  try {
    const request = `https://test.api.qazaqmura.kz/v1/book/school?book_inventory=1&page=${page.value}`;
    const response = await api.fetchData<{ data: { items: Inventory[] }, meta: { last_page: number } }>(request)
    if (response.data) {
      items.value = response.data.data.items;
      length.value = response.data.meta.last_page;
      loading.value = false;
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

getContractors()

watch(page, () => { getContractors() })
watch(search, () => { getContractors() })
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Инвентарный учет</span>
          <span class="text-subtitle-2 text-medium-emphasis">Инвентаризация книг по мере поступления и списания
            онлайн</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" prepend-icon="mdi-chevron-down" class="mr-3">Скачать список как PDF</v-btn>
        <v-btn variant="tonal" class="mr-3">Списание</v-btn>
        <v-btn variant="flat" color="primary" class="mr-3">Инвентаризация</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-video-outline">Помощь</v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock inventory :mdata="false" :users="false" :one-line="false" :bottom-items="bottomItems">
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table show-select :headers="headers" :items="items" class="mt-2">
      <template v-slot:[`item.author`]="{ item }">
        <span>
          {{ item.book.book_author_main.map(item => item.name).join(', ') }}
        </span>
      </template>

      <template v-slot:[`item.actions`]="{ }">
        <div class="d-flex justify-center">
          <v-btn variant="outlined" append-icon="mdi-arrow-right">Перейти</v-btn>
        </div>
      </template>

      <template v-slot:bottom> </template>
    </v-data-table>

    <v-row class="mt-4">
      <v-pagination class="ml-auto mr-2" :length="length" :total-visible="4" v-model="page" size="small" variant="flat"
        active-color="primary"></v-pagination>
    </v-row>
  </v-container>
</template>