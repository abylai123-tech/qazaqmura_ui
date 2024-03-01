<script setup lang="ts">
import { useAPI } from '@/api';
import { watch } from 'vue';
import { ref, type Ref } from 'vue';

interface Contractor {
  id: number,
  system: boolean,
  title: string,
  address: string,
  company_ID: string
}

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название и БИН', key: 'name' },
  { title: 'Поступление', key: 'amount' },
  { title: 'Адрес', key: 'address' },
  { title: 'Системный', key: 'system' },
  { title: '', key: 'actions', sortable: false }
]

const loading: Ref<boolean> = ref(false);
const page: Ref<number> = ref(1);
const length: Ref<number> = ref(0);
const items: Ref<Contractor[]> = ref([]);
const search: Ref<string | null> = ref(null);

const api = useAPI();

async function getContractors() {
  loading.value = true;
  try {
    let request = `https://test.api.qazaqmura.kz/v1/contractor?page=${page.value}`;
    if (search.value) {
      request += `&search=${search.value}`
    }
    const response = await api.fetchData<{ data: { items: Contractor[] }, meta: { last_page: number } }>(request)
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
          <span class="text-h6 font-weight-bold">Контрагент</span>
          <span class="text-subtitle-2 text-medium-emphasis">Название организации откуда вы покупаете книги</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3" prepend-icon="mdi-video-outline">Помощь</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus">Добавить</v-btn>
      </template>
    </v-app-bar>

    <v-data-table show-select :headers="headers" :items="items" :loading="loading" class="mt-2">
      <template v-slot:top>
        <div class="d-flex my-3 mx-4">
          <v-text-field v-model="search" label="Поиск по Названию и БИН" density="compact" variant="outlined" flat
            single-line hide-details class="rounded-xl" prepend-inner-icon="mdi-magnify"></v-text-field>
          <div class="d-flex justify-space-around w-50">
            <div class="d-flex flex-column">
              <strong>420</strong>
              <span>Системные</span>
            </div>
            <div class="d-flex flex-column">
              <strong>300</strong>
              <span>Библиотеки</span>
            </div>
          </div>
          <!-- <v-select value="Показывать по 10" :items="['Показывать по 10']" density="compact" flat single-line
            hide-details></v-select> -->
        </div>
      </template>

      <template v-slot:item.name="{ item }">
        <div class="d-flex flex-column">
          <strong>{{ item.title }}</strong>
          <span>{{ item.company_ID }}</span>
        </div>
      </template>

      <template v-slot:item.amount="{ }">
        <div class="d-flex flex-column my-2">
          <v-chip variant="flat" class="mb-2" color="primary">Наименование: 5</v-chip>
          <v-chip variant="flat" color="primary">Экземпляров: 36</v-chip>
        </div>
      </template>

      <template v-slot:item.system="{ item }">
        <v-chip v-if="item.system" variant="flat" color="primary">Да</v-chip>
        <v-chip v-else variant="flat" color="secondary">Нет</v-chip>
      </template>

      <template v-slot:item.actions="{ }">
        <div class="d-flex justify-center">
          <v-btn variant="text" icon="mdi-pencil"></v-btn>
          <v-btn variant="text" icon="mdi-trash-can-outline" color="error"></v-btn>
        </div>
      </template>

      <template v-slot:bottom> </template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination class="ml-auto mr-2" size="small" variant="flat" active-color="primary" :length="length"
        :total-visible="4" v-model="page"></v-pagination>
    </v-row>
  </v-container>
</template>
