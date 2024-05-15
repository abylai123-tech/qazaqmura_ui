<script lang="ts" setup>
import { useAPI } from '@/api'
import { ref, type Ref, watch } from 'vue'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import fileDownload from 'js-file-download'

interface Contractor {
  id: number
  system: boolean
  title: string
  address: string
  company_ID: string
}

const newItem: Ref<{ address: string; company_ID: string; title: string }> = ref({
  address: '',
  company_ID: '',
  title: ''
})

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Название и БИН', key: 'name' },
  { title: 'Поступление', key: 'amount' },
  { title: 'Адрес', key: 'address' },
  { title: 'Системный', key: 'system' },
  { title: '', key: 'actions', sortable: false }
]

const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(0)
const items: Ref<Contractor[]> = ref([])
const search: Ref<string | null> = ref(null)
const drawer: Ref<boolean> = ref(false)
const api = useAPI()
const auth = useAuth()

async function getContractors() {
  loading.value = true
  try {
    let request = `/v1/contractor?page=${page.value}`
    if (search.value) {
      request += `&search=${search.value}`
    }
    const response = await api.fetchData<{
      data: { items: Contractor[] }
      meta: { last_page: number }
    }>(request)
    if (response.data) {
      items.value = response.data.data.items
      length.value = response.data.meta.last_page
      loading.value = false
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function createContractor() {
  const requestObject: { title: string; company_ID?: string; address?: string } = {
    title: newItem.value.title
  }
  if (newItem.value.address.length > 0) requestObject.address = newItem.value.address
  if (newItem.value.company_ID.length > 0) requestObject.company_ID = newItem.value.company_ID

  try {
    await api.postData('/v1/contractor', requestObject)

    await getContractors()
    drawer.value = false
    newItem.value = { title: '', company_ID: '', address: '' }
  } catch (e) {
    console.error('Error:', e)
  }
}

const downloadList = async () => {
  const response = await api.postData(`/v1/book/school/contractor/pdf`, null, true)
  if (response.data) fileDownload(response.data, 'Список контрагентов.pdf')
}

getContractors()

watch(page, () => {
  getContractors()
})
watch(search, () => {
  getContractors()
})
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">Добавить контрагент</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span class="font-weight-bold">Основная</span>
      </v-list-item>
      <v-list-item>
        <v-form>
          <v-text-field v-model="newItem.title" label="Название" variant="outlined"></v-text-field>
          <v-text-field
            v-model="newItem.company_ID"
            label="БИН (необязательно)"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="newItem.address"
            label="Адрес (необязательно)"
            variant="outlined"
          ></v-text-field>
          <!--          <v-autocomplete label="Особенность (необязательно)" variant="outlined"></v-autocomplete>-->
        </v-form>
      </v-list-item>

      <v-list-item>
        <v-btn class="mr-10" variant="tonal" @click="drawer = false">Закрыть</v-btn>
        <v-btn color="primary" variant="flat" @click="createContractor">Добавить</v-btn>
      </v-list-item>
    </v-navigation-drawer>

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
        <v-btn class="mr-3" color="primary" variant="flat" @click="downloadList">Скачать</v-btn>
        <help-button></help-button>
        <v-btn
          class="ml-3"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="drawer = true"
          >Добавить
        </v-btn>
      </template>
    </v-app-bar>

    <v-data-table :headers="headers" :items="items" :loading="loading" class="mt-2" show-select>
      <template v-slot:top>
        <div class="d-flex my-3 mx-4">
          <v-text-field
            v-model="search"
            class="rounded-xl"
            density="compact"
            flat
            hide-details
            label="Поиск по Названию и БИН"
            prepend-inner-icon="mdi-magnify"
            single-line
            variant="outlined"
          ></v-text-field>
          <div class="d-flex justify-space-around w-50">
            <div class="d-flex flex-column">
              <strong>420</strong>
              <span>Системные</span>
            </div>
            <div class="d-flex flex-column">
              <strong>300</strong>
              <span>Библиотеки</span>
            </div>
          </div>
          <!-- <v-select value="Показывать по 10" :items="['Показывать по 10']" density="compact" flat single-line
            hide-details></v-select> -->
        </div>
      </template>

      <template v-slot:[`item.name`]="{ item }">
        <div class="d-flex flex-column">
          <strong>{{ item.title }}</strong>
          <span>{{ item.company_ID }}</span>
        </div>
      </template>

      <template v-slot:[`item.amount`]="{}">
        <div class="d-flex flex-column my-2">
          <v-chip class="mb-2" color="primary" variant="flat">Наименование: 5</v-chip>
          <v-chip color="primary" variant="flat">Экземпляров: 36</v-chip>
        </div>
      </template>

      <template v-slot:[`item.system`]="{ item }">
        <v-chip v-if="item.system" color="primary" variant="flat">Да</v-chip>
        <v-chip v-else color="secondary" variant="flat">Нет</v-chip>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div
          v-if="!item.system || auth.user.value.roles.some((obj) => obj.id === 1)"
          class="d-flex justify-center"
        >
          <v-btn icon="mdi-pencil" variant="text"></v-btn>
          <v-btn color="error" icon="mdi-trash-can-outline" variant="text"></v-btn>
        </div>
      </template>

      <template v-slot:bottom></template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination
        v-model="page"
        :length="length"
        :total-visible="6"
        active-color="primary"
        class="ml-auto mr-2"
        size="small"
        variant="flat"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
