<script setup lang="ts">
const items = [
  { id: 1, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 2, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: true },
  { id: 3, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 4, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 5, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 6, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 7, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 8, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 9, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 10, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 11, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false },
  { id: 12, name: 'Комедии', author: 'Карло Гольдони', date: '03 Jan 2023', status: false }
]
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">M-DATA</span>
          <span class="text-subtitle-2 text-medium-emphasis">Описание</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3">Отчет по издателям</v-btn>
        <v-btn variant="tonal" class="mr-3" append-icon="mdi-chevron-down"
          >Генерация документов</v-btn
        >
        <v-btn variant="tonal" class="mr-3" append-icon="mdi-chevron-down">Скачать PDF</v-btn>
        <v-btn variant="flat" color="primary">Выбрать дату</v-btn>
      </template>
    </v-app-bar>

    <v-row class="bg-white rounded-lg mx-2 my-3">
      <v-col cols="4">
        <v-text-field
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          label="Поиск по названию"
          density="compact"
          single-line
          hide-details
          class="py-2"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row class="mx-2 mt-2">
      <v-col v-for="item in items" :key="item.id" cols="3">
        <v-card variant="outlined">
          <template v-slot:title>
            <div class="d-flex">
              <span>{{ item.name }}</span>
              <v-spacer></v-spacer>
              <v-btn variant="text" size="sm" icon="mdi-dots-vertical"></v-btn>
            </div>
          </template>

          <template v-slot:subtitle>
            <span class="text-primary text-subtitle-2 font-weight-bold">{{ item.author }}</span>
          </template>

          <template v-slot:text>
            <div class="d-flex flex-column">
              <div class="d-flex">
                <v-icon icon="mdi-calendar-month-outline"></v-icon>
                <span class="ml-2">Год издания: {{ item.date }}</span>
              </div>
              <div class="d-flex mt-2">
                <v-chip label color="red">EPUB</v-chip>

                <v-chip label color="green" class="ml-2" v-if="item.status"
                  >Cтатус : Добавлен</v-chip
                >
                <v-chip label v-else class="ml-2">Cтатус : Поступил</v-chip>
              </div>
            </div>
          </template>

          <template v-slot:actions>
            <v-btn variant="flat" class="w-100" :disabled="item.status" color="primary"
              >Добавить в фонд</v-btn
            >
          </template>
        </v-card>
      </v-col>
    </v-row>

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
