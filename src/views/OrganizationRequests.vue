<script lang="ts" setup>
import { ref, watch, type Ref } from 'vue'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()
const page = ref(1)
const length = ref(1)
const items = ref([])

const getItems = async () => {
  const response = await api.fetchData(`/v1/online/apply?page=${page.value}`)
  if (response.data) {
    items.value = response.data.data.items
    length.value = response.data.meta.last_page
  }
}

const getColor = (status: { key: string; title: string }) => {
  if (status.key === 'rejected') return 'red'
  else if (status.key === 'new') return 'primary'
  else return 'green'
}
const drawer = ref(false)
const selectedRequest = ref({
  library: {},
  organization: {},
  responsiblePerson: {},
  region: {
    title: ''
  }
})
const selectRequest = async (id: number) => {
  const response = await api.fetchData(`/v1/online/apply/${id}`)
  if (response.data) {
    selectedRequest.value = response.data
  }
  drawer.value = true
}

const changeRequestStatus = async (status: number) => {
  if (status > 0) {
    try {
      const response = await api.postData(`/v1/online/apply/status/${selectedRequest.value.id}`, {
        status
      })
      drawer.value = false
      if (status === 1) {
        const link = document.createElement('a')
        link.href = `${import.meta.env.VITE_APP_API}/storage${response.data.path}`
        link.download = 'Заявка.pdf'
        link.target = '_blank'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (e) {
      console.error('Error:', e.message)
      snackbar.value = true
      snackbarMessage.value = e.message
    }
  } else {
    this.drawer = false
  }
  await getItems()
}

const binForSearch = ref<string>('');
const regionIdForSearch = ref<number | null>(null);
const selectedRegionTitle = ref<string>('Выбрать регион')
const region = ref<Region | null>(null);
const subRegion = ref<Region | null>(null);
const thirdRegion = ref<Region | null>(null);

const searchOnlineApplies = async () => {
  try {
    let request = '/v1/online/apply?1=1';
    if (binForSearch.value.length > 0) {
      request += `&bin=${binForSearch.value}`
    }
    if (regionIdForSearch.value) {
      request += `&region_id=${regionIdForSearch.value}`
    }
    const response = await api.fetchData<{ data: { items: [] }, meta: { last_page: number } }>(request) 
    if (response.data) {
      page.value = 1
      items.value = response.data.data.items
      length.value = response.data.meta.last_page
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

interface Region {
  id: number
  title: string
}

const regions = ref<Region[]>([])
const subRegions = ref<Region[]>([])
const thirdRegions = ref<Region[]>([])

const getRegions = async () => {
  try {
    const response = await api.fetchData<{ data: { items: Region[] } }>('/v1/region')
    if (response.data)
      regions.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

getRegions()

const getSubRegions = async (parentRegionId: number | null) => {
  try {
    const response = await api.fetchData<{ data: { items: Region[] } }>(`/v1/region?parent_id=${parentRegionId}`)
    if (response.data)
      subRegions.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const getThirdRegions = async (parentRegionId: number | null) => {
  try {
    const response = await api.fetchData<{ data: { items: Region[] } }>(`/v1/region?parent_id=${parentRegionId}`)
    if (response.data)
      thirdRegions.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

watch(region, (newValue) => getSubRegions(newValue ? newValue.id : null))
watch(subRegion, (newValue) => getThirdRegions(newValue ? newValue.id : null))

watch(binForSearch, () => searchOnlineApplies())

const getFile = async (id: number) => {
  if (id != null) {
    try {
      const response = await api.postData(`/v1/user/sign-up/pdf/${id}`, null)
      const path = response.data.path
      const link = document.createElement('a')
      link.setAttribute('href', import.meta.env.VITE_APP_API + '/storage' + path)
      link.setAttribute('download', 'Заявка.pdf')
      link.setAttribute('target', '_blank')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error('Error:', e.message)
    }
  }
}

const selectRegion = async (isActive: Ref<boolean>) => {
  if (region.value) {
    regionIdForSearch.value = region.value.id
    selectedRegionTitle.value = region.value.title
  }
  if (subRegion.value) {
    regionIdForSearch.value = subRegion.value.id
    selectedRegionTitle.value = subRegion.value.title
  }
  if (thirdRegion.value) {
    regionIdForSearch.value = thirdRegion.value.id
    selectedRegionTitle.value = thirdRegion.value.title
  }
  region.value = null
  subRegion.value = null
  thirdRegion.value = null

  await searchOnlineApplies()

  isActive.value = false
}

const resetRegion = async () => {
  regionIdForSearch.value = null
  selectedRegionTitle.value = 'Выбрать регион'

  await searchOnlineApplies()
}

const snackbar = ref(false)
const snackbarMessage = ref('')

getItems()

watch(page, () => {
  getItems()
})
</script>

<template>
  <v-snackbar :timeout="3000" v-model="snackbar">{{ snackbarMessage }}</v-snackbar>
  <v-container fluid>
    <v-app-bar flat>
      <v-container class="mx-auto d-flex align-center justify-center">
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">{{ t('requests') }}</span>
        </div>
        <v-spacer></v-spacer>
        <v-responsive class="mr-3" max-width="250">
          <v-text-field label="БИН" variant="outlined" hide-details single-line density="compact" v-model="binForSearch"></v-text-field>
        </v-responsive>
        <v-responsive class="mr-3" max-width="250">
          <v-dialog max-width="800">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" block variant="tonal">{{ selectedRegionTitle }}</v-btn>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card>
              <v-card-title>Выбрать регион</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-autocomplete v-model="region" return-object :items="regions" variant="outlined" density="compact" hide-details single-line></v-autocomplete>
                <v-autocomplete v-if=region class="mt-3" v-model="subRegion" return-object :items="subRegions" variant="outlined" density="compact" hide-details single-line></v-autocomplete>
                <v-autocomplete v-if="subRegion" class="mt-3" v-model="thirdRegion" return-object :items="thirdRegions" variant="outlined" density="compact" hide-details single-line></v-autocomplete>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-actions>
                <v-row class="mx-auto d-flex align-center justify-center">
                  <v-btn color="primary" variant="flat" :disabled="!region" @click="selectRegion(isActive)">Сохранить</v-btn>
                </v-row>
              </v-card-actions>
            </v-card>
            </template>
          </v-dialog>
          
        </v-responsive>
        <v-responsive v-if="regionIdForSearch" max-width="200">
          <v-btn block variant="tonal" @click="resetRegion()">Сбросить регион</v-btn>
        </v-responsive>
      </v-container>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" location="right" temporary width="700">
      <v-list>
        <v-list-item>
          <v-card class="border" title="Данные организации">
            <v-table>
              <tbody>
                <tr>
                  <td>Полное название организации</td>
                  <td>{{ selectedRequest.organization.title }}</td>
                </tr>
                <tr>
                  <td>БИН</td>
                  <td>{{ selectedRequest.organization.ID }}</td>
                </tr>
                <tr>
                  <td>Город и регион</td>
                  <td>{{ selectedRequest.region.title }}</td>
                </tr>
                <tr>
                  <td>Телефон</td>
                  <td>{{ selectedRequest.organization.phone }}</td>
                </tr>
                <tr>
                  <td>Адрес школы</td>
                  <td>{{ selectedRequest.organization.address }}</td>
                </tr>
                <tr>
                  <td>Почтовый индекс</td>
                  <td>{{ selectedRequest.organization.postIndex }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-list-item>
        <v-list-item>
          <v-card class="border" title="Директор или бухгалтер">
            <v-table>
              <tbody>
                <tr>
                  <td>Фамилия</td>
                  <td>{{ selectedRequest.responsiblePerson.lastname }}</td>
                </tr>
                <tr>
                  <td>Имя</td>
                  <td>{{ selectedRequest.responsiblePerson.name }}</td>
                </tr>
                <tr>
                  <td>Отчество</td>
                  <td>{{ selectedRequest.responsiblePerson.fathername }}</td>
                </tr>
                <tr>
                  <td>Должность</td>
                  <td>{{ selectedRequest.responsiblePerson.position }}</td>
                </tr>
                <tr>
                  <td>Телефон</td>
                  <td>{{ selectedRequest.responsiblePerson.phone }}</td>
                </tr>
                <tr>
                  <td>Электронная почта</td>
                  <td>{{ selectedRequest.responsiblePerson.email }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-list-item>
        <v-list-item>
          <v-card class="border" title="Данные библиотекаря">
            <v-table>
              <tbody>
                <tr>
                  <td>Фамилия</td>
                  <td>{{ selectedRequest.library.lastname }}</td>
                </tr>
                <tr>
                  <td>Имя</td>
                  <td>{{ selectedRequest.library.name }}</td>
                </tr>
                <tr>
                  <td>Отчество</td>
                  <td>{{ selectedRequest.library.fathername }}</td>
                </tr>
                <tr>
                  <td>{{t('iin')}}</td>
                  <td>{{ selectedRequest.library.ID }}</td>
                </tr>
                <tr>
                  <td>Телефон</td>
                  <td>{{ selectedRequest.library.phone }}</td>
                </tr>
                <tr>
                  <td>Электронная почта</td>
                  <td>{{ selectedRequest.library.email }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-list-item>
        <v-list-item>
          <v-btn class="mr-2" variant="tonal" @click="drawer = false">{{t('close')}}</v-btn>
          <v-btn class="mr-2" color="primary" variant="flat" @click="changeRequestStatus(0)"
            >Отложить заявку
          </v-btn>
          <v-btn class="mr-2" color="red" variant="flat" @click="changeRequestStatus(2)"
            >Отклонить
          </v-btn>
          <v-btn color="green" variant="flat" @click="changeRequestStatus(1)">Принять</v-btn>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-row>
      <v-col>
        <v-data-table
          :headers="[
            { key: 'id', title: 'ID' },
            { title: t('full_name'), key: 'initiator' },
            { title: 'Школа', key: 'organization' },
            { title: t('actions'), key: 'actions' }
          ]"
          :items="items"
          :items-per-page="15"
        >
          <template v-slot:bottom></template>
          <template v-slot:[`item.initiator`]="{ item }">
            <div class="font-weight-bold mt-2">{{ item.fullname }}</div>
            <div class="text-medium-emphasis my-1">{{ item.phone }}</div>
            <div class="mb-2">
              <v-chip :color="getColor(item.status)" variant="flat">{{ item.status.title }}</v-chip>
            </div>
          </template>
          <template v-slot:[`item.organization`]="{ item }">
            <div>{{ item.school }}</div>
            <div>
              <v-chip size="small" variant="outlined">{{ item.region.title }}</v-chip>
            </div>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <div style="width: 15vw">
              <v-btn
                append-icon="mdi-arrow-right"
                variant="outlined"
                @click="selectRequest(item.id)"
                >{{t('go_to')}}
              </v-btn>
              <v-btn
                class="ml-2"
                icon="mdi-download"
                variant="flat"
                @click="getFile(item.userId)"
              ></v-btn>
            </div>
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
