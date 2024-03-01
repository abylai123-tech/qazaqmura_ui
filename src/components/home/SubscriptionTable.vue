<script setup lang="ts">
import { useAPI } from '@/api';
import type { Ref } from 'vue';
import { ref, computed } from 'vue';

const api = useAPI();

const headers = [
  { title: 'Название книги', key: 'title' },
  { title: 'Автор' },
  { title: 'Типы книг' },
  { title: 'Год издания' },
  { title: 'Цифры', key: 'amount' }
]

interface Subscription {
  title: string,
  status: string,
  count: number,
}

const items: Ref<Subscription[]> = ref([])

const loading: Ref<boolean> = ref(false);

const tab: Ref<number> = ref(1);

async function getItems() {
  loading.value = true;
  try {
    const response = await api.fetchData<{ data: { items: Subscription[] } }>('https://test.api.qazaqmura.kz/v1/dashboard/subscription-modal')
    if (response.data) items.value = response.data.data.items;
    loading.value = false;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const returns = computed(() => {
  return items.value.filter((item) => {
    return item.status === 'return';
  })
})

const requests = computed(() => {
  return items.value.filter((item) => {
    return item.status === 'request';
  })
})

getItems();

</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="4">
        <v-tabs class="mb-5" color="primary" v-model="tab">
          <v-tab :value="1">Выдача</v-tab>
          <v-tab :value="2">Возврат</v-tab>
        </v-tabs>

        <v-select variant="outlined" label="Типы книг"></v-select>
        <v-select variant="outlined" label="Выдача и возврат"></v-select>
        <v-text-field variant="outlined" label="Фильтр по дате" prepend-inner-icon="mdi-calendar"></v-text-field>
      </v-col>
      <v-col>
        <v-window v-model="tab">
          <v-window-item :value="1">
            <v-data-table color="primary" :loading="loading" :items="requests" :headers="headers">
              <template v-slot:bottom></template>
            </v-data-table>
          </v-window-item>

          <v-window-item :value="2">
            <v-data-table color="primary" :loading="loading" :items="returns" :headers="headers">
              <template v-slot:bottom></template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>