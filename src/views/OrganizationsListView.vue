<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useAPI } from '@/api'

const api = useAPI()

const headers = [
  { title: 'ID', key: 'id' },
  {
    title: 'Название',
    key: 'name'
  },
  { title: 'Адрес', key: 'address' },
  { title: 'Статус', key: 'status' },
  { title: '', sortable: false, key: 'actions' }
]

const page = ref(1)

const organizations = ref([])
const length = ref(0)

const getOrganizations = async () => {
  const response = await api.fetchData(`/v1/school?page=${page.value}`)
  if (response.data) {
    organizations.value = response.data.data.items
    length.value = response.data.meta.last_page
  }
}

getOrganizations()

watch(page, () => {
  getOrganizations()
})
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Организации</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >Онлайн читательский билет класса, запись и регистрация читателей, выдача
          </span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal">Регион</v-btn>
        <v-btn class="ml-3" variant="tonal">Тип</v-btn>
        <v-btn class="ml-3" variant="tonal">Классный руководитель</v-btn>
        <v-btn class="ml-3" color="primary" prepend-icon="mdi-plus" variant="flat">Добавить</v-btn>
      </template>
    </v-app-bar>
    <v-row>
      <v-col>
        <v-data-table :headers="headers" :items="organizations" :items-per-page="15">
          <template v-slot:top>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  class="rounded my-2 ml-2"
                  density="compact"
                  label="Поиск по БИН / Название"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>
          </template>
          <template v-slot:bottom></template>

          <template v-slot:[`item.address`]="{ item }">
            <div class="text-medium-emphasis">Адрес: {{ item.description.address }}</div>
            <div class="text-medium-emphasis">Индекс: {{ item.description.zip_code }}</div>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <div class="mt-2 mb-1">
              <v-chip color="primary" variant="flat">M-Data: {{ item.book_count }}</v-chip>
            </div>
            <div class="mb-2">
              <v-chip variant="flat">Фонд: {{ item.book_school_count }}</v-chip>
            </div>
          </template>

          <template v-slot:[`item.name`]="{ item }">
            <div class="font-weight-bold mt-3 mb-1">{{ item.name }}</div>
            <div class="mb-3">
              <v-chip color="primary" size="small" variant="outlined"
                >БИН: {{ item.description.bin }}
              </v-chip>
              <v-chip
                :color="item.activated === 1 ? 'green' : 'red'"
                class="ml-1"
                size="small"
                variant="flat"
              >
                {{ item.activated ? 'Активен' : 'Не активен' }}
              </v-chip>
            </div>
          </template>

          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              :to="`/organizations/${item.id}`"
              append-icon="mdi-arrow-right"
              variant="outlined"
              >Перейти
            </v-btn>
            <v-btn class="ml-2" icon="mdi-download" variant="flat"></v-btn>
          </template>
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
