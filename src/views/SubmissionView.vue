<script setup lang="ts">
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'Год издания', key: 'year' },
  { title: 'Контрагент', key: 'contractor' },
  { title: 'Дата поступления', key: 'date' },
  { title: 'Цена', key: 'price' },
  { title: 'Кол-во', key: 'amount' },
  { title: '', key: 'actions', sortable: false }
]

const items = [
  {
    id: 1,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11',
    status: false,
  },
  {
    id: 2,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11',
    status: false,
  },
  {
    id: 3,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11', status: false,
  },
  {
    id: 4,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11',
    status: false,
  },
  {
    id: 5,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11',
    status: false,
  },
  {
    id: 6,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11',
    status: false,
  },
  {
    id: 7,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11',
    status: false,
  },
  {
    id: 8,
    name: 'Теккерей',
    year: '1997',
    role: 'Название',
    date: '21.01.2023',
    price: '5999 KZT',
    amount: '11',
    status: false,
  }
]
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Поступления</span>
          <span class="text-subtitle-2 text-medium-emphasis">Описание</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3">Отчет по издателям</v-btn>
        <v-btn variant="tonal" class="mr-3" append-icon="mdi-chevron-down">Генерация документов</v-btn>
        <v-btn variant="tonal" class="mr-3" append-icon="mdi-chevron-down">Скачать PDF</v-btn>
        <v-btn variant="flat" color="primary">Выбрать дату</v-btn>
      </template>
    </v-app-bar>

    <v-data-table show-select :headers="headers" :items="items" class="mt-2">
      <template v-slot:top>
        <div class="d-flex my-3 mx-4">
          <v-text-field label="Поиск по ИИН / ФИО" density="compact" variant="outlined" flat single-line hide-details
            class="rounded-xl" prepend-inner-icon="mdi-magnify"></v-text-field>
          <v-spacer></v-spacer>
          <v-select value="Показывать по 10" :items="['Показывать по 10']" density="compact" flat single-line
            hide-details></v-select>
        </div>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <v-chip v-if="item.status" color="green" variant="flat">Активен</v-chip>
        <v-chip v-else color="error" variant="flat">Не активен</v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ }">
        <div class="d-flex justify-center">
          <v-btn variant="flat" icon="mdi-dots-vertical"></v-btn>
        </div>
      </template>

      <template v-slot:bottom> </template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination class="ml-auto mr-2" :length="4" size="small" variant="flat" active-color="primary"></v-pagination>
    </v-row>
  </v-container>
</template>
