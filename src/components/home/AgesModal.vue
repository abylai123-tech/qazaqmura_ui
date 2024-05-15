<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref } from 'vue'

const api = useAPI()

interface Age {
  age: string
  count: number
  percent: string
}

const headers = [
  { key: 'age', title: 'Возраст' },
  { key: 'percent', title: 'Процент' },
  { key: 'count', title: 'Количество' }
]

const items: Ref<Age[]> = ref([])

async function getAges() {
  try {
    const response = await api.fetchData<Age[]>('/v1/dashboard/user/age/full')
    if (response.data) {
      items.value = response.data
    }
  } catch (error: any) {
    console.error('Error:', error)
  }
}

getAges()
</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn color="primary" v-bind="activatorProps" variant="flat">Подробнее</v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">Читатели по возрасту</strong>
            <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
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
