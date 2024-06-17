<script lang="ts" setup>
import { useAPI } from '@/api'
import { computed, type Ref, ref, watch } from 'vue'
import FilterBlock from '@/components/FilterBlock.vue'
import HelpButton from '@/components/HelpButton.vue'
import { useAuth } from '@/auth'
import fileDownload from 'js-file-download'

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
  lastname: string
  phone: string
  role: { id: number }
  school_id: number
  sex: number
  account: {
    login: string
    password: string
  }
  relation: {
    firstname: string
    lastname: string
    phone: string
    user_relative_id: number
  }
  region_id: number
}

interface Filter {
  search: string
  class_id: number | null
  classroom_id: number | null
  isActive: boolean
  promiser: boolean
  status: boolean
  class: number | null
  teacher: number | null
  role_id: number | null
}

const filters: Ref<Filter> = ref({
  search: '',
  class_id: null,
  classroom_id: null,
  isActive: false,
  promiser: false,
  status: false,
  class: null,
  teacher: null,
  role_id: null
})

const requestBody: Ref<RequestBody> = ref({
  birthday: '',
  document_ID: '',
  email: '',
  fathername: '',
  firstname: '',
  lastname: '',
  phone: '',
  role: null,
  school_id: 0,
  sex: 0,
  account: {
    login: '',
    password: ''
  },
  relation: {
    firstname: '',
    lastname: '',
    phone: '',
    user_relative_id: 0
  },
  region_id: 0
})

const phoneNumberRules = computed(() => {
  return [
    (v) => !!v || 'Обязательное поле',
    (v) => /^\+\d\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(v) || 'Неправильный формат телефона'
  ]
})

const formatPhoneNumber = () => {
  let formatted = requestBody.value.phone.replace(/\D/g, '')
  if (formatted.length > 0) {
    formatted =
      '+7(' +
      formatted.substring(1, 4) +
      ')' +
      formatted.substring(4, 7) +
      '-' +
      formatted.substring(7, 9) +
      '-' +
      formatted.substring(9, 11)
  }
  requestBody.value.phone = formatted
}

const handleBackspace = (event) => {
  if (
    event.target.selectionStart === event.target.selectionEnd &&
    event.target.selectionStart === 0
  ) {
    requestBody.value.phone = ''
    event.preventDefault()
  }
}

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
    const response = await api.fetchData('/v1/user/relative')
    if (response.data) {
      userRelative.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

async function getRoles() {
  try {
    const response = await api.fetchData('/v1/role')
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
    let request = `/v2/user?page=${page.value}`
    if (filters.value.search.length > 0) request += `&search=${filters.value.search}`
    if (filters.value.promiser) request += '&promiser=1'
    if (filters.value.status) request += '&status=0'
    if (filters.value.class) request += `&classroom=${filters.value.class}`
    if (filters.value.teacher) request += `&teacher_id=${filters.value.teacher}`
    if (filters.value.role_id) request += `&role_id=${filters.value.role_id}`
    const response = await api.fetchData<{
      data: User[]
      meta: { last_page: number }
    }>(request)
    if (response.data) {
      items.value = response.data.data
      length.value = response.data.meta.last_page
    }
    loading.value = false
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const snackbar = ref(false)

async function sendFile() {
  try {
    if (importFile.value) {
      const formData = new FormData()
      formData.append('file', importFile.value[0])
      const response = await api.postData('/v2/user/excel', formData)
      if (response.data && response.data.success) {
        snackbar.value = true
        drawer.value = false
      }
    }
  } catch (error: any) {
    console.error('Error:', error)
  }
}

function downloadExcel() {
  const link = document.createElement('a')
  link.href = '/assets/excel.xlsx'
  link.download = 'user-list.xlsx'
  link.click()
  document.body.removeChild(link)
}

const subscriptionBlock: Ref<{ label: string; value: string }[]> = ref([])

async function getSubscriptionBlock() {
  try {
    const response = await api.fetchData<{
      promisers: string
      requests: string
      returns: string
    }>('/v1/dashboard/subscriptions')
    if (response.data) {
      subscriptionBlock.value = [
        { label: 'Выдачи', value: response.data.requests },
        {
          label: 'Возвраты',
          value: response.data.returns
        },
        { label: 'Должники', value: response.data.promisers }
      ]
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const letters: Ref<string[]> = ref([])
const numbers: Ref<number[]> = ref([])

interface Classroom {
  number: number | null
  letter: string | null
  user_id: number | null
  pupil_id: number | null
}

const classroom: Ref<Classroom> = ref({
  number: null,
  letter: null,
  user_id: null,
  pupil_id: null
})

const getLettersAndNumbers = async () => {
  try {
    const response = await api.fetchData<{
      data: {
        items: { id: number; letter: string; number: number }[]
      }
    }>('/v1/classroom/letters?full=1')
    if (response.data) {
      numbers.value = response.data.numbers
      letters.value = response.data.letters
    }
    numbers.value = [...new Set(numbers.value)].sort()
    letters.value = [...new Set(letters.value)].sort()
  } catch (e) {
    console.error('Error:', e)
  }
}

getUsers()
getRelatives()
getRoles()
getSubscriptionBlock()
getLettersAndNumbers()

watch(page, () => {
  getUsers()
})

function formatDate(dateToFormat: string) {
  const parts = dateToFormat.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  return `${day}.${month}.${year}`
}

const auth = useAuth()

const createUser = async () => {
  try {
    const birthday = formatDate(requestBody.value.birthday)
    const request = {
      firstname: requestBody.value.firstname,
      lastname: requestBody.value.lastname,
      fathername: requestBody.value.fathername,
      role_id: requestBody.value.role.id,
      birthday: birthday,
      sex: requestBody.value.sex
    }
    if (requestBody.value.email.length > 0) request.email = requestBody.value.email
    if (requestBody.value.phone.length > 0) request.phone = requestBody.value.phone
    if (requestBody.value.document_ID.length > 0)
      request.document_ID = requestBody.value.document_ID

    if (addContactPerson.value) request.relation = requestBody.value.relation
    if (regionId.value) request['region_id'] = regionId.value
    if (organization.value) request['school_id'] = organization.value.id

    const response = await api.postData('/v1/user', request)
    if (response.data && addStructure.value) {
      classroom.value.pupil_id = response.data.id
      classroom.value.user_id = auth.user.value.id

      await api.postData('/v1/classroom/user', classroom.value)

      createDrawer.value = false
      await getUsers()

      requestBody.value = {
        birthday: '',
        document_ID: '',
        email: '',
        fathername: '',
        firstname: '',
        lastname: '',
        phone: '',
        role: null,
        school_id: 0,
        sex: 0,
        account: {
          login: '',
          password: ''
        },
        relation: {
          firstname: '',
          lastname: '',
          phone: '',
          user_relative_id: 0
        },
        region_id: 0
      }
    }
    createDrawer.value = false
  } catch (e) {
    console.error('Error:', e)
  }
}

const structureDrawer: Ref<boolean> = ref(false)
const structure: Ref<
  {
    id: number
    school_id: number
    title: string
  }[]
> = ref([])

const schools: Ref<any[]> = ref([])
const getSchools = async () => {
  try {
    const response = await api.fetchData<{
      data: { items: { id: number; school_id: number; title: string }[] }
    }>(`/v1/school?page=1`)
    if (response.data) schools.value = response.data.data.items
    schools.value.forEach(async (item) => {
      item.structure = await getStructure(item.id)
      item.structure.forEach(async (structureItem) => {
        structureItem.classrooms = await getClassroom(structureItem.id)
      })
    })
  } catch (e) {
    console.error('Error:', e)
  }
}
const getStructure = async (id: number) => {
  try {
    const response = await api.fetchData<{
      data: { items: { id: number; school_id: number; title: string }[] }
    }>(`/v1/school/structure?school_id=${id}`)
    return response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const getClassroom = async (id: number) => {
  try {
    const response = await api.fetchData<{
      data: { items: { id: number; school_id: number; title: string }[] }
    }>(`/v1/classroom?school_structure_id=${id}`)
    return response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const role = computed(() => {
  return auth.user.value?.roles
})

const downloadList = async (id?: number) => {
  let url = '/v1/user/user/pdf'
  if (id) url += `?role_id=${id}`
  const response = await api.postData(url, null, true)
  if (response.data) fileDownload(response.data, 'users.pdf')
}

const getFilterSearch = () => {
  page.value = 1
  getUsers()
}

const getRegions = async (parentId: number | null = null) => {
  try {
    let request = '/v1/region'
    if (parentId) request += `?parent_id=${parentId}`
    const response = await api.fetchData<{ data: { items: Region[] } }>(request)
    if (response.data) {
      if (parentRegion.value && childRegion.value) thirdRegions.value = response.data.data.items
      else if (parentRegion.value) childrenRegions.value = response.data.data.items
      else parentRegions.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

interface Region {
  id: number
  parent_id: number | null
  number: string
  title: string
}

interface Organization {
  id: number
  label: string
}

const organization = ref<Organization | null>(null)
const organizations = ref<Organization[]>([])

const getOrganizations = async (search?: string) => {
  let request = '/v1/school'
  if (search) {
    request += `?search=${search}`
  }
  const response = await api.fetchData<{ data: { items: Organization[] } }>(request)
  if (response.data) {
    organizations.value = response.data.data.items
  }
}

const parentRegions: Ref<Region[]> = ref([])
const childrenRegions: Ref<Region[]> = ref([])
const thirdRegions: Ref<Region[]> = ref([])
const parentRegion: Ref<Region | null> = ref(null)
const childRegion: Ref<Region | null> = ref(null)
const thirdRegion: Ref<Region | null> = ref(null)
const regionId: Ref<number | null> = ref(null)
const regionTitle: Ref<string> = ref('')

const chooseRegion = (isActive: Ref<boolean>) => {
  if (parentRegion.value && childRegion.value && thirdRegion.value) {
    regionId.value = thirdRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title} / ${thirdRegion.value.title}`
  } else if (parentRegion.value && childRegion.value) {
    regionId.value = childRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title}`
  } else if (parentRegion.value) {
    regionId.value = parentRegion.value.id
    regionTitle.value = `${parentRegion.value.title}`
  }
  isActive.value = false
}

watch(parentRegion, async (value) => {
  if (value) await getRegions(value.id)
})

watch(childRegion, async (value) => {
  if (value) await getRegions(value.id)
})

getSchools()
getRegions()
getOrganizations()
</script>

<template>
  <v-container fluid>
    <v-snackbar v-model="snackbar" :timeout="10000" color="primary"
      >Список учеников добавлен в систему
    </v-snackbar>
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
            v-model="requestBody.role"
            :items="roles"
            item-title="label"
            item-value="id"
            label="Роль"
            return-object
            variant="outlined"
          ></v-autocomplete>
          <v-autocomplete
            v-if="
              requestBody.role &&
              requestBody.role.id === 3 &&
              role &&
              role.some((item) => {
                return item.id === 1
              })
            "
            v-model="organization"
            :items="organizations"
            item-title="name"
            label="Организация"
            return-object
            variant="outlined"
            @update:search="getOrganizations"
          ></v-autocomplete>
          <v-dialog v-if="requestBody.role && requestBody.role.id === 8" width="65vw">
            <template v-slot:activator="{ props }">
              <v-text-field
                :model-value="regionTitle"
                label="Регион"
                placeholder="Выберите регион"
                v-bind="props"
                variant="outlined"
              ></v-text-field>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span class="text-h6 font-weight-bold">Выбрать регион</span>
                    <v-btn icon="mdi-close" variant="text" @click="isActive.value = false"></v-btn>
                  </div>
                </v-card-title>
                <v-card-text>
                  <v-select
                    v-model="parentRegion"
                    :items="parentRegions"
                    item-value="id"
                    label="Регион"
                    placeholder="Выберите регион"
                    return-object
                    variant="outlined"
                  ></v-select>
                  <v-select
                    v-if="childrenRegions.length > 0"
                    v-model="childRegion"
                    :items="childrenRegions"
                    item-value="id"
                    label="Регион"
                    placeholder="Выберите регион"
                    return-object
                    variant="outlined"
                  ></v-select>
                  <v-select
                    v-if="thirdRegions.length > 0"
                    v-model="thirdRegion"
                    :items="thirdRegions"
                    item-value="id"
                    label="Регион"
                    placeholder="Выберите регион"
                    return-object
                    variant="outlined"
                  ></v-select>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn variant="tonal" @click="isActive.value = false">Закрыть</v-btn>
                  <v-btn color="primary" variant="flat" @click="chooseRegion(isActive)"
                    >Выбрать
                  </v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
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
            :rules="phoneNumberRules"
            class="ml-4"
            label="Номер телефона"
            maxlength="16"
            variant="outlined"
            @input="formatPhoneNumber"
          ></v-text-field>
        </div>
        <v-switch
          v-model="addContactPerson"
          class="ml-2"
          color="primary"
          label="Добавить контактное лицо"
        ></v-switch>
        <v-switch v-model="addStructure" class="ml-2" color="primary" label="Структура"></v-switch>
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
          <v-select
            v-model="classroom.number"
            :items="numbers"
            class="mt-2"
            clearable
            label="Цифра класса"
            variant="outlined"
          ></v-select>
          <v-select
            v-model="classroom.letter"
            :items="letters"
            class="ml-4 mt-2"
            clearable
            label="Буква класса"
            variant="outlined"
          ></v-select>
        </div>
      </v-list-item>

      <v-list-item class="mt-2 mb-6 text-center">
        <v-btn class="mr-10" variant="tonal" @click="createDrawer = false">Закрыть</v-btn>
        <v-btn color="primary" variant="flat" @click="createUser">Добавить</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="structureDrawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">Структура</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-data-table
          :headers="[
            { key: 'id', title: 'ID' },
            { key: 'name', title: 'Название' }
          ]"
          :items="schools"
          :items-per-page="15"
          show-expand
        >
          <template v-slot:expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length">
                <v-data-table
                  :headers="[
                    { key: 'id', title: 'ID' },
                    { key: 'title', title: 'Название' }
                  ]"
                  :items="item.structure"
                  show-expand
                >
                  <template v-slot:headers></template>
                  <template v-slot:expanded-row="{ columns, item }">
                    <tr>
                      <td :colspan="columns.length">
                        <v-data-table
                          :headers="[
                            { key: 'id', title: 'ID' },
                            { key: 'title', title: 'Название' }
                          ]"
                          :items="item.classrooms"
                          show-expand
                        >
                          <template v-slot:headers></template>
                          <template v-slot:[`item.title`]="{ item }">
                            <span>{{ item.number }} {{ item.letter }}</span>
                          </template>

                          <template v-slot:expanded-row="{ columns, item }">
                            <tr>
                              <td :colspan="columns.length">
                                <v-data-table
                                  v-if="item.pupils.length > 0"
                                  :headers="[
                                    { key: 'id', title: 'ID' },
                                    { key: 'name', title: 'Имя' }
                                  ]"
                                  :items="item.pupils"
                                >
                                  <template v-slot:headers></template>
                                  <template v-slot:[`item.name`]="{ item }">
                                    <span
                                      >{{ item.user_data.lastname }} {{ item.user_data.firstname }}
                                      {{ item.user_data.fathername }}</span
                                    >
                                  </template>
                                  <template v-slot:bottom></template>
                                </v-data-table>
                                <v-data-table
                                  :headers="[
                                    { key: 'id', title: 'ID' },
                                    { key: 'name', title: 'Имя' }
                                  ]"
                                  :items="[item.teacher]"
                                >
                                  <template v-slot:headers></template>
                                  <template v-slot:[`item.name`]="{ item }">
                                    <span
                                      >{{ item.user_data.lastname }} {{ item.user_data.firstname }}
                                      {{ item.user_data.fathername }}</span
                                    >
                                  </template>
                                  <template v-slot:bottom></template>
                                </v-data-table>
                              </td>
                            </tr>
                          </template>

                          <template v-slot:bottom></template>
                        </v-data-table>
                      </td>
                    </tr>
                  </template>
                  <template v-slot:bottom></template>
                </v-data-table>
              </td>
            </tr>
          </template>

          <template v-slot:[`item.name`]="{ item }">
            <v-btn color="primary" variant="text" @click="getStructure(item.id)"
              >{{ item.name }}
            </v-btn>
          </template>
          <template v-slot:bottom></template>
        </v-data-table>
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
        <v-btn class="mr-3" variant="tonal" @click="structureDrawer = true">Структура</v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn append-icon="mdi-chevron-down" class="mr-3" v-bind="props" variant="tonal"
              >Скачать PDF
            </v-btn>
          </template>

          <v-list>
            <v-list-item :value="1" @click="downloadList()">Весь список</v-list-item>
            <v-list-item :value="2" @click="downloadList(4)">Классный руководитель</v-list-item>
            <v-list-item :value="3" @click="downloadList(5)">Школьники</v-list-item>
            <v-list-item :value="4" @click="downloadList(6)">Сотрудники школы</v-list-item>
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

        <help-button />
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <FilterBlock
          v-model="filters"
          :bottom-items="subscriptionBlock"
          :inventory="false"
          :mdata="false"
          :oneLine="false"
          users
          @search="getFilterSearch"
        >
        </FilterBlock>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="15"
      :loading="loading"
      class="mt-2"
      show-select
    >
      <!--      <template v-slot:top>-->
      <!--        <div class="d-flex my-3 mx-4">-->
      <!--          <v-text-field-->
      <!--            class="rounded-xl"-->
      <!--            density="compact"-->
      <!--            flat-->
      <!--            hide-details-->
      <!--            label="Поиск по ИИН / ФИО"-->
      <!--            prepend-inner-icon="mdi-magnify"-->
      <!--            single-line-->
      <!--            variant="outlined"-->
      <!--          ></v-text-field>-->
      <!--          <v-spacer></v-spacer>-->
      <!--          <v-select-->
      <!--            :items="['Показывать по 10']"-->
      <!--            density="compact"-->
      <!--            flat-->
      <!--            hide-details-->
      <!--            single-line-->
      <!--            value="Показывать по 10"-->
      <!--          ></v-select>-->
      <!--        </div>-->
      <!--      </template>-->

      <template v-slot:[`item.name`]="{ item }">
        <div class="d-flex flex-column my-2">
          <div>
            {{ item.lastname }} {{ item.firstname }} {{ item.fathername }} /
            <strong>{{ item.classroom }}</strong>
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
            <v-chip v-if="item.role" class="mr-2" color="primary" size="small" variant="outlined"
              >{{ item.role }}
            </v-chip>
            <v-chip v-if="item.status" color="green" size="small" variant="flat">Активен</v-chip>
            <v-chip v-else color="error" size="small" variant="flat">Не активен</v-chip>
          </div>
        </div>
      </template>

      <template v-slot:[`item.id`]="{ item }">
        <div class="font-weight-bold">ID: {{ item.user_id }}</div>
        <div class="text-medium-emphasis">{{ item.id_ }}</div>
      </template>

      <template v-slot:[`item.data`]="{ item }">
        <div class="font-weight-bold">{{ item.login }}</div>
        <div class="d-flex flex-column">
          <span class="text-subtitle-2 text-medium-emphasis">{{ item.email }}</span>
          <span class="text-subtitle-2 text-medium-emphasis">{{ item.phone }}</span>
        </div>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        <div v-if="item.subscription" class="d-flex flex-column align-center">
          <v-chip class="mb-2" color="primary" size="small" variant="flat"
            >Выдача: {{ item.subscription.request }}
          </v-chip>
          <v-chip size="small" variant="flat">Возврат: {{ item.subscription.return }}</v-chip>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex align-center">
          <v-btn
            :to="`/users/${item.user_id}`"
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
        :total-visible="6"
        active-color="primary"
        class="ml-auto mr-2"
        size="small"
        variant="flat"
      ></v-pagination>
    </v-row>
  </v-container>
</template>
