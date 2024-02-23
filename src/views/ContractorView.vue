<script setup lang="ts">
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название', key: 'name' },
  { title: 'БИН', key: 'bin' },
  { title: 'Адрес', key: 'address' },
  { title: 'Системный', key: 'system' },
  { title: '', key: 'actions', sortable: false }
]

const items = [
  {
    id: 1,
    name: '«Алматыкітап» баспасы',
    bin: '060940004520',
    address: 'г.Алматы, Алмалинский район, улица Жамбыла, 111',
    system: true
  }
]
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Контрагент</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >Название организации откуда вы покупаете книги</span
          >
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3" prepend-icon="mdi-video-outline">Помощь</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus">Добавить</v-btn>
      </template>
    </v-app-bar>

    <v-data-table show-select :headers="headers" :items="items" class="mt-2">
      <template v-slot:top>
        <div class="d-flex my-3 mx-4">
          <v-text-field
            label="Поиск по ИИН / ФИО"
            density="compact"
            variant="outlined"
            flat
            single-line
            hide-details
            class="rounded-xl"
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-select
            value="Показывать по 10"
            :items="['Показывать по 10']"
            density="compact"
            flat
            single-line
            hide-details
          ></v-select>
        </div>
      </template>

      <template v-slot:item.system="{ item }">
        <v-chip v-if="item.system" variant="flat" color="primary">Да</v-chip>
        <v-chip v-else variant="flat" color="secondary">Нет</v-chip>
      </template>

      <template v-slot:item.actions="{}">
        <div class="d-flex justify-center">
          <v-btn variant="text" icon="mdi-refresh"></v-btn>
          <v-btn variant="text" icon="mdi-eye-outline"></v-btn>
          <v-btn variant="text" icon="mdi-tray-arrow-down"></v-btn>
          <v-btn variant="text" icon="mdi-trash-can-outline" color="error"></v-btn>
        </div>
      </template>

      <template v-slot:bottom> </template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination
        class="ml-auto mr-2"
        :length="4"
        size="small"
        variant="flat"
        active-color="primary"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
