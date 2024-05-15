<script lang="ts" setup>
import { ref, type Ref } from 'vue'
import { useAPI } from '@/api'

interface Publisher {
  publisher_id: number
  publisher: string
  amount: string
  books: number
}

const api = useAPI()

const publisherHeaders = [
  { key: 'publisher', title: 'Название' },
  { key: 'books', title: 'Наименование книг' },
  { key: 'amount', title: 'Экземпляры книг' }
]

const publishers: Ref<Publisher[] | null> = ref(null)
const publishersLoading: Ref<boolean> = ref(false)

async function getPublishers(): Promise<void> {
  publishersLoading.value = true
  try {
    const response = await api.fetchData<Publisher[]>(`/v1/dashboard/publisher?all=1`)
    publishers.value = response.data
    publishersLoading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

getPublishers()
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
            <strong class="my-auto">Издательства</strong>
            <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <v-data-table :headers="publisherHeaders" :items="publishers ? publishers : []">
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
