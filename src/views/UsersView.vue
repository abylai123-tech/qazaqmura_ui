<script lang="ts" setup>
import { useAPI } from '@/api'
import { type Ref, ref, watch } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue'

interface User {
  id: number
  firstname: string
  lastname: string
  fathername: string
  login: string
  phone: string
  email: string
  activated_at: string
  last_used_at: string
  status: boolean
}

interface RequestBody {
  birthday: string
  document_ID: string
  email: string
  fathername: string
  firstname: string
  role_id: number
  lastname: string
  phone: string
  sex: number
  relation: {
    firstname: string
    lastname: string
    phone: string
    user_relation_id: number
  }
}

const requestBody: Ref<RequestBody> = ref({
  birthday: '',
  document_ID: '',
  email: '',
  fathername: '',
  role_id: '',
  firstname: '',
  lastname: '',
  phone: '',
  sex: 1,
  relation: {
    firstname: '',
    lastname: '',
    phone: '',
    user_relation_id: 0
  }
})

const bottomItems = [
  { label: 'Выдачи', value: 12 },
  { label: 'Возвраты', value: 8 },
  { label: 'Должники', value: 1 }
]

const api = useAPI()

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'ФИО', key: 'name' },
  { title: 'Данные', key: 'data' },
  { title: 'Статус', key: 'status' },
  { title: '', key: 'actions', sortable: false }
]
const loading: Ref<boolean> = ref(false)
const page: Ref<number> = ref(1)
const length: Ref<number> = ref(1)
const items: Ref<User[]> = ref([])
const drawer: Ref<boolean> = ref(false)
const importFile: Ref<File[] | undefined> = ref(undefined)
const createDrawer: Ref<boolean> = ref(false)
const addContactPerson: Ref<boolean> = ref(false)
const addStructure: Ref<boolean> = ref(false)
const userRelative: Ref<{ id: number; title: string }[]> = ref([])
const roles: Ref<{ id: number; title: string }[]> = ref([])

async function getRelatives() {
  try {
    const response = await api.fetchData('https://test.api.qazaqmura.kz/v1/user/relative')
    if (response.data) {
      userRelative.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

async function getRoles() {
  try {
    const response = await api.fetchData('https://test.api.qazaqmura.kz/v1/role')
    if (response.data) {
      roles.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

async function getUsers() {
  loading.value = true
  try {
    const response = await api.fetchData<{
      data: User[]
      meta: { last_page: number }
    }>(`https://test.api.qazaqmura.kz/v2/user?page=${page.value}`)
    if (response.data) {
      items.value = response.data.data
      length.value = response.data.meta.last_page
    }
    loading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function sendFile() {
  try {
    if (importFile.value) {
      const formData = new FormData()
      formData.append('file', importFile.value[0])
      const response = await api.postData('https://test.api.qazaqmura.kz/v2/user/excel', formData)
      console.log('Response:', response)
    }
  } catch (error: any) {
    console.error('Error:', error)
  }
}

function downloadExcel() {
  const link = document.createElement('a')
  link.href = '/src/assets/excel.xlsx'
  link.download = 'document.xlsx'
  link.click()
  document.body.removeChild(link)
}

getUsers()
getRelatives()
getRoles()

watch(page, () => {
  getUsers()
})
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="400">
      <v-list-item>
        <span class="font-weight-bold">Импорт пользователя</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span
          >Библиотечная система при загрузке файла пользователей предоставляет эффективный и удобный
          способ организации информации. Загрузка файла позволяет пользователям быстро добавлять
          множество записей в библиотеку, повышая её функциональность.</span
        >
      </v-list-item>
      <v-list-item>
        <v-file-input v-model="importFile" label="Файл" show-size></v-file-input>
        <small class="font-weight-bold">Перетащите файл сюда или нажмите, чтобы загрузить</small
        ><br />
        <small>Максимальный размер файла: 300 MB</small>
      </v-list-item>
      <v-list-item class="mt-2 text-center">
        <v-btn color="primary" variant="flat" @click="sendFile">Отправить</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="createDrawer" location="right" temporary width="700">
      <v-list-item>
        <span class="font-weight-bold">Добавить пользователя</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span class="font-weight-bold">Основное</span>
      </v-list-item>

      <v-list-item>
        <v-form class="mt-4">
          <v-text-field
            v-model="requestBody.document_ID"
            label="ИИН (необязательно)"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="requestBody.lastname"
            label="Фамилия"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="requestBody.firstname"
            label="Имя"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="requestBody.fathername"
            label="Отчество (необязательно)"
            variant="outlined"
          ></v-text-field>
          <v-autocomplete
            v-model="requestBody.role_id"
            :items="roles"
            item-title="label"
            item-value="id"
            label="Роль"
            variant="outlined"
          ></v-autocomplete>
        </v-form>
      </v-list-item>

      <v-list-item>
        <v-btn
          append-icon="mdi-plus"
          color="primary"
          text="Расширенные данные"
          variant="text"
        ></v-btn>
      </v-list-item>

      <v-list-item>
        <div class="d-flex mt-4 align-center">
          <v-text-field
            v-model="requestBody.birthday"
            label="Дата рождения"
            type="date"
            variant="outlined"
          ></v-text-field>
          <v-radio-group v-model="requestBody.sex" class="ml-4" color="primary" inline>
            <v-radio :value="1" label="Мужчина"></v-radio>
            <v-radio :value="2" label="Женщина"></v-radio>
          </v-radio-group>
        </div>
        <div class="d-flex mt-4 align-center">
          <v-text-field v-model="requestBody.email" label="Email" variant="outlined"></v-text-field>
          <v-text-field
            v-model="requestBody.phone"
            class="ml-4"
            label="Номер телефона"
            variant="outlined"
          ></v-text-field>
        </div>
        <v-switch
          v-model="addContactPerson"
          color="primary"
          label="Добавить контактное лицо"
        ></v-switch>
        <v-switch v-model="addStructure" color="primary" label="Структура"></v-switch>
      </v-list-item>

      <v-list-item v-if="addContactPerson">
        <div class="font-weight-bold">Контакное лицо</div>
        <v-text-field
          v-model="requestBody.relation.firstname"
          label="Имя"
          variant="outlined"
        ></v-text-field>
        <v-text-field
          v-model="requestBody.relation.lastname"
          label="Фамилия"
          variant="outlined"
        ></v-text-field>
        <div class="d-flex">
          <v-text-field
            v-model="requestBody.relation.phone"
            label="Номер телефона"
            type="tel"
            variant="outlined"
          ></v-text-field>
          <v-autocomplete
            v-model="requestBody.relation.user_relative_id"
            :items="userRelative"
            class="ml-4"
            item-title="title"
            item-value="id"
            label="Кем приходится для пользователя"
            variant="outlined"
          ></v-autocomplete>
        </div>
      </v-list-item>

      <v-list-item v-if="addStructure">
        <div class="font-weight-bold">Структура</div>
        <div class="d-flex">
          <v-text-field label="Цифра класса" variant="outlined"></v-text-field>
          <v-text-field class="ml-4" label="Буква класса" variant="outlined"></v-text-field>
        </div>
      </v-list-item>

      <v-list-item class="mt-2 mb-6 text-center">
        <v-btn class="mr-10" variant="tonal" @click="createDrawer = false">Закрыть</v-btn>
        <v-btn color="primary" variant="flat" @click="createUser">Добавить</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Абонемент</span>
          <span class="text-subtitle-2 text-medium-emphasis"
            >Онлайн читательский билет класса, запись и регистрация читателей, выдача
          </span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn class="mr-3" variant="tonal">Структура</v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn append-icon="mdi-chevron-down" class="mr-3" v-bind="props" variant="tonal"
              >Скачать PDF
            </v-btn>
          </template>

          <v-list>
            <v-list-item :value="1">Весь список</v-list-item>
            <v-list-item :value="2">Классный руководитель</v-list-item>
            <v-list-item :value="3">Школьники</v-list-item>
            <v-list-item :value="4">Сотрудники школы</v-list-item>
          </v-list>
        </v-menu>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              append-icon="mdi-chevron-down"
              class="mr-3"
              color="primary"
              v-bind="props"
              variant="flat"
              >Добавить
            </v-btn>
          </template>

          <v-list>
            <v-list-item :value="1" @click="downloadExcel">Скачать шаблон импорта</v-list-item>
            <v-list-item :value="2" @click="drawer = true">Импорт</v-list-item>
            <v-list-item :value="3" @click="createDrawer = true"
              >Добавить индивидуально
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn prepend-icon="mdi-video-outline" variant="tonal">Помощь</v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock
          :bottom-items="bottomItems"
          :inventory="false"
          :mdata="false"
          :oneLine="false"
          users
        >
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table :headers="headers" :items="items" :loading="loading" class="mt-2" show-select>
      <template v-slot:top>
        <div class="d-flex my-3 mx-4">
          <v-text-field
            class="rounded-xl"
            density="compact"
            flat
            hide-details
            label="Поиск по ИИН / ФИО"
            prepend-inner-icon="mdi-magnify"
            single-line
            variant="outlined"
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-select
            :items="['Показывать по 10']"
            density="compact"
            flat
            hide-details
            single-line
            value="Показывать по 10"
          ></v-select>
        </div>
      </template>

      <template v-slot:[`item.name`]="{ item }">
        <div class="d-flex flex-column my-2">
          <div>
            {{ item.lastname }} {{ item.firstname }} {{ item.fathername }} / <strong>1Б</strong>
          </div>
          <div>
            <span class="text-subtitle-2 text-medium-emphasis"
              >Первая активность: {{ item.activated_at }}</span
            >
          </div>
          <div>
            <span class="text-subtitle-2 text-medium-emphasis"
              >Последняя активность: {{ item.last_used_at }}</span
            >
          </div>
          <div class="my-2">
            <v-chip class="mr-2" color="primary" size="small" variant="outlined"
              >Библиотекарь
            </v-chip>
            <v-chip v-if="item.status" color="green" size="small" variant="flat">Активен</v-chip>
            <v-chip v-else color="error" size="small" variant="flat">Не активен</v-chip>
          </div>
        </div>
      </template>

      <template v-slot:[`item.data`]="{ item }">
        <div class="font-weight-bold">{{ item.login }}</div>
        <div class="d-flex flex-column">
          <span class="text-subtitle-2 text-medium-emphasis">{{ item.email }}</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{ item.phone }}</span>
        </div>
      </template>

      <template v-slot:[`item.status`]="{}">
        <div class="d-flex flex-column align-center">
          <v-chip class="mb-2" color="primary" size="small" variant="flat">Выдача: 1</v-chip>
          <v-chip size="small" variant="flat">Возврат: 4</v-chip>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex align-center">
          <v-btn
            :to="`/users/${item.id}`"
            append-icon="mdi-arrow-right"
            class="mr-2"
            variant="outlined"
            >Перейти
          </v-btn>
          <v-btn icon="mdi-download" variant="text"></v-btn>
        </div>
      </template>

      <template v-slot:bottom></template>
    </v-data-table>
    <v-row class="mt-4">
      <v-pagination
        v-model="page"
        :length="length"
        :total-visible="4"
        active-color="primary"
        class="ml-auto mr-2"
        size="small"
        variant="flat"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
