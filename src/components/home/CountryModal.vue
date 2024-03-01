<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useAPI } from '@/api';

interface Country {
  amount: number,
  country: string,
  percent: string,
}

const api = useAPI();

const countriesHeaders = [
  { key: 'country', title: 'Страна' },
  { key: 'amount', title: 'Экземпляры книг' },
]

const countries: Ref<Country[] | null> = ref(null)
const countriesLoading: Ref<boolean> = ref(false);

async function getCountries(): Promise<void> {
  countriesLoading.value = true;
  try {
    const response = await api.fetchData<{ detailed: Country[] }>(`https://test.api.qazaqmura.kz/v1/dashboard/country`);
    if (response.data) countries.value = response.data.detailed;
    countriesLoading.value = false;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

getCountries()
</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" variant="flat" color="primary">Подробнее</v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">Книги по странам</strong>
            <v-btn variant="text" icon="mdi-close" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <v-data-table :headers="countriesHeaders" :items="countries ? countries : []">
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>