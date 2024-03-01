<script setup lang="ts">
import { useAPI } from '@/api';
import { watch } from 'vue';
import { type Ref, ref } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue';

interface User {
  id: number,
  firstname: string,
  lastname: string,
  fathername: string,
  login: string,
  phone: string,
  status: boolean,
}

const bottomItems = [
  { label: 'Выдачи', value: 12 },
  { label: 'Возвраты', value: 8 },
  { label: 'Должники', value: 1 }
]

const api = useAPI();

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'ФИО', key: 'name' },
  { title: 'Данные', key: 'data' },
  { title: 'Статус', key: 'status' },
  { title: '', key: 'actions', sortable: false }
]
const loading: Ref<boolean> = ref(false);
const page: Ref<number> = ref(1);
const length: Ref<number> = ref(1);
const items: Ref<User[]> = ref([]);
const drawer: Ref<boolean> = ref(false)

async function getUsers() {
  loading.value = true;
  try {
    const response = await api.fetchData<{ data: User[], meta: { last_page: number } }>(`https://test.api.qazaqmura.kz/v2/user?page=${page.value}`);
    if (response.data) {
      items.value = response.data.data;
      length.value = response.data.meta.last_page;
    }
    loading.value = false;
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

function downloadExcel() {
  const link = document.createElement('a');
  link.href = '/src/assets/excel.xlsx';
  link.download = 'document.xlsx';
  link.click();
  document.body.removeChild(link);
}

getUsers()

watch(page, () => { getUsers() })
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer width="400" temporary :absolute="true" location="right" v-model="drawer">
      <v-list-item>
        <span class="font-weight-bold">Импорт пользователя</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span>Библиотечная система при загрузке файла пользователей предоставляет эффективный и удобный способ организации
          информации. Загрузка файла позволяет пользователям быстро добавлять множество записей в библиотеку, повышая её
          функциональность.</span>
      </v-list-item>
      <v-list-item>
        <v-file-input show-size label="Файл"></v-file-input>
        <small class="font-weight-bold">Перетащите файл сюда или нажмите, чтобы загрузить</small><br />
        <small>Максимальный размер файла: 300 MB</small>
      </v-list-item>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Абонемент</span>
          <span class="text-subtitle-2 text-medium-emphasis">Онлайн читательский билет класса, запись и регистрация
            читателей, выдача </span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3">Структура</v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="tonal" class="mr-3" append-icon="mdi-chevron-down">Скачать PDF</v-btn>
          </template>

          <v-list>
            <v-list-item :value="1">Весь список</v-list-item>
            <v-list-item :value="2">Классный руководитель</v-list-item>
            <v-list-item :value="3">Школьники</v-list-item>
            <v-list-item :value="4">Сотрудники школы</v-list-item>
          </v-list>
        </v-menu>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn class="mr-3" v-bind="props" variant="flat" color="primary"
              append-icon="mdi-chevron-down">Добавить</v-btn>
          </template>

          <v-list>
            <v-list-item @click="downloadExcel" :value="1">Скачать шаблон импорта</v-list-item>
            <v-list-item @click="drawer = true" :value="2">Импорт</v-list-item>
            <v-list-item :value="3">Добавить индивидуально</v-list-item>
          </v-list>
        </v-menu>

        <v-btn variant="tonal" prepend-icon="mdi-video-outline">Помощь</v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock :oneLine="false" users :mdata="false" :inventory="false" :bottom-items="bottomItems">
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table show-select :loading="loading" :headers="headers" :items="items" class="mt-2">
      <template v-slot:top>
        <div class="d-flex my-3 mx-4">
          <v-text-field label="Поиск по ИИН / ФИО" density="compact" variant="outlined" flat single-line hide-details
            class="rounded-xl" prepend-inner-icon="mdi-magnify"></v-text-field>
          <v-spacer></v-spacer>
          <v-select value="Показывать по 10" :items="['Показывать по 10']" density="compact" flat single-line
            hide-details></v-select>
        </div>
      </template>

      <template v-slot:[`item.name`]="{ item }">
        <div class="d-flex flex-column my-2">
          <div>
            {{ item.lastname }} {{ item.firstname }} {{ item.fathername }} / <strong>1Б</strong>
          </div>
          <div class="my-2">
            <v-chip size="small" color="primary" class="mr-2" variant="outlined">Библиотекарь</v-chip>
            <v-chip size="small" v-if="item.status" color="green" variant="flat">Активен</v-chip>
            <v-chip size="small" v-else color="error" variant="flat">Не активен</v-chip>
          </div>
        </div>
      </template>

      <template v-slot:[`item.data`]="{ item }">
        <div class="d-flex flex-column subtitle-text">
          <span>{{ item.phone }}</span>
        </div>
      </template>

      <template v-slot:[`item.status`]="{ }">
        <div class="d-flex flex-column align-center">
          <v-chip size="small" color="primary" class="mb-2" variant="flat">Выдача: 1</v-chip>
          <v-chip size="small" variant="flat">Возврат: 4</v-chip>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ }">
        <div class="d-flex align-center">
          <v-btn variant="outlined" class="mr-2" append-icon="mdi-arrow-right">Перейти</v-btn>
          <v-btn variant="text" icon="mdi-download"></v-btn>
        </div>
      </template>

      <template v-slot:bottom> </template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination class="ml-auto mr-2" v-model="page" :total-visible="4" :length="length" size="small" variant="flat"
        active-color="primary"></v-pagination>
    </v-row>
  </v-container>
</template>
