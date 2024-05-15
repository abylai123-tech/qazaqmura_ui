<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useAPI } from '@/api'

const api = useAPI()
const page = ref(1)
const items = ref([])
const length = ref(1)

const getItems = async () => {
  const response = await api.fetchData(`/v1/apply?page=${page.value}`)
  if (response.data) {
    items.value = response.data.data.items
    length.value = response.data.meta.last_page
  }
}

getItems()

watch(page, () => {
  getItems()
})
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Заявки</span>
        </div>
      </template>
    </v-app-bar>
    <v-row>
      <v-col>
        <v-data-table
          :headers="[
            { key: 'id', title: 'ID' },
            { title: 'Заявка от:', key: 'initiator' },
            { title: 'Почта', key: 'message' },
            { title: 'Организация', key: 'organization' },
            { title: 'Дата создания', key: 'createdAt' }
          ]"
          :items="items"
          :items-per-page="15"
        >
          <template v-slot:[`item.initiator`]="{ item }">
            <div class="font-weight-bold">{{ item.full_name }}</div>
            <div>{{ item.phone }}</div>
          </template>
          <template v-slot:[`item.organization`]="{ item }">
            <div>{{ item.school }}</div>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            <v-chip color="primary" variant="flat">{{ item.created_at }}</v-chip>
          </template>
          <template v-slot:bottom></template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-pagination
          v-model="page"
          :length="length"
          :total-visible="6"
          active-color="primary"
          class="ml-auto mr-2"
          size="small"
          variant="flat"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
