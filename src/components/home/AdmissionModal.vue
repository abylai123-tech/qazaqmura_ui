<script setup lang="ts">
import { useAPI } from '@/api';

const api = useAPI()

async function getAdmissions() {
  try {
    const response = await api.fetchData('https://test.dls.qazaqmura.kz/v1/book/school/admission')
    console.log("Response:", response.data)
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const headers = [
  { key: 'number', title: '№' },
  { key: 'type', title: 'Тип книги' },
  { key: 'name', title: 'Наименование' },
  { key: 'exemplar', title: 'Экземпляр' }
]

const items = [
  { number: 1, type: 'Художественная литература', name: 12, exemplar: 77 },
  { number: 2, type: 'Без отметки типа', name: 1, exemplar: 177 },
  { number: 3, type: 'Учебное пособие', name: 4, exemplar: 14 },
  { number: 4, type: 'Детские сказки ', name: 6, exemplar: 22 },
]

getAdmissions()
</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" color="primary" variant="flat" icon="mdi-chevron-right"></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">Школьный фонд</strong>
            <v-btn variant="text" icon="mdi-close" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <v-data-table :headers="headers" :items="items">
            <template v-slot:bottom></template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>