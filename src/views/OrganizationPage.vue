<script lang="ts" setup>
import { useAPI } from '@/api'
import { useRoute } from 'vue-router'
import HelpButton from '@/components/HelpButton.vue'
import { type Ref, ref, watch } from 'vue'
import school from '@/assets/school.svg'

const api = useAPI()
const route = useRoute()

const headers = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: 'ФИО' },
  { key: 'activity', title: 'Данные' },
  { key: 'actions', title: 'Статус' }
]

const items = [
  { id: 1, name: 'The Life and Diaries of Anne Frank', activity: 1 },
  { id: 40, name: 'The Life and Diaries of Anne Frank', activity: 2 }
]

const organization = ref({
  organization: { label: '' },
  description: {
    address: '',
    bin: '',
    zip_code: ''
  }
})

const organizationTypes = ref<OrganizationType[]>([])
const subscriptions = [
  { id: 0, title: 'Тестовый' },
  { id: 1, title: 'Договор' }
]
const subscriptionTypes = [
  { id: 1, title: '1 месяц' },
  { id: 2, title: '2 месяца' },
  { id: 3, title: '3 месяца' },
  { id: 4, title: '4 месяца' },
  { id: 5, title: '5 месяца' },
  { id: 6, title: '6 месяца' },
  { id: 7, title: '7 месяцев' },
  { id: 8, title: '8 месяцев' },
  { id: 9, title: '9 месяцев' },
  { id: 10, title: '10 месяцев' },
  { id: 11, title: '11 месяцев' },
  { id: 12, title: '12 месяцев' }
]

const getOrganizationTypes = async () => {
  const response = await api.fetchData<{ data: { items: OrganizationType[] } }>('/v1/organization')
  if (response.data) {
    organizationTypes.value = response.data.data.items
  }
}

interface Region {
  id: number
  parent_id: number | null
  number: string
  title: string
}

const parentRegions: Ref<Region[]> = ref([])
const childrenRegions: Ref<Region[]> = ref([])
const thirdRegions: Ref<Region[]> = ref([])
const parentRegion: Ref<Region | null> = ref(null)
const childRegion: Ref<Region | null> = ref(null)
const thirdRegion: Ref<Region | null> = ref(null)
const regionId: Ref<number | null> = ref(null)
const regionTitle: Ref<string> = ref('')
const organizationDrawer = ref(false)

const requestBody = ref({
  name: '',
  bin: '',
  address: '',
  zip_code: '',
  region_id: null,
  organization_id: null,
  subscription: {
    period: null,
    type: null,
    activated_at: null
  }
})

const getRegions = async (parentId: number | null = null) => {
  try {
    let request = '/v1/region/open'
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

const chooseRegion = (isActive: Ref<boolean>) => {
  if (parentRegion.value && childRegion.value && thirdRegion.value) {
    requestBody.value.region_id = thirdRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title} / ${thirdRegion.value.title}`
  } else if (parentRegion.value && childRegion.value) {
    requestBody.value.region_id = childRegion.value.id
    regionTitle.value = `${parentRegion.value.title} / ${childRegion.value.title}`
  } else if (parentRegion.value) {
    requestBody.value.region_id = parentRegion.value.id
    regionTitle.value = `${parentRegion.value.title}`
  }
  isActive.value = false
}

function formatDate(dateToFormat: string) {
  const parts = dateToFormat.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  return `${day}.${month}.${year}`
}

const sendEdit = async () => {
  if (requestBody.value.subscription.activated_at) {
    requestBody.value.subscription.activated_at = formatDate(
      requestBody.value.subscription.activated_at
    )
  }

  await api.putData(`/v1/school/${route.params.id}`, requestBody.value)
  requestBody.value = {
    name: '',
    bin: '',
    address: '',
    zip_code: '',
    region_id: null,
    organization_id: null,
    subscription: {
      period: null,
      type: null,
      activated_at: null
    }
  }
  await getOrganization()
  organizationDrawer.value = false
}

const editOrganization = () => {
  requestBody.value.name = organization.value.name
  requestBody.value.bin = organization.value.description.bin
  requestBody.value.address = organization.value.description.address
  requestBody.value.zip_code = organization.value.description.zip_code
  requestBody.value.organization_id = organization.value.organization
    ? organization.value.organization.id
    : null
  requestBody.value.region_id = organization.value.region_id
  organizationDrawer.value = true
  getOrganization()
}

const regionName = ref('')

const findRegion = async (regionId: number | null) => {
  if (regionId) {
    const response = await api.fetchData(`/v1/region/${regionId}`)
    if (response.data) {
      regionName.value = response.data.title
    }
  }
}

watch(parentRegion, async (value) => {
  if (value) await getRegions(value.id)
})

watch(childRegion, async (value) => {
  if (value) await getRegions(value.id)
})

getRegions()
getOrganizationTypes()

async function getOrganization() {
  try {
    const response = await api.fetchData(`/v1/school/${route.params.id}`)
    organization.value = response.data
    await findRegion(organization.value.region_id)
  } catch (error) {
    console.log('Error:', error)
  }
}

getOrganization()
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <v-btn :to="{ name: 'organizationList' }" prepend-icon="mdi-arrow-left" variant="text"
        >Назад к списку
      </v-btn>
      <v-spacer></v-spacer>
      <help-button></help-button>
    </v-app-bar>

    <v-navigation-drawer v-model="organizationDrawer" location="right" temporary width="700">
      <v-list-item>
        <span class="font-weight-bold">Изменить организацию</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span class="font-weight-bold">Основное</span>
      </v-list-item>

      <v-list-item>
        <v-text-field
          v-model="requestBody.name"
          class="mt-1"
          label="Название"
          variant="outlined"
        ></v-text-field>
        <v-text-field v-model="requestBody.bin" label="БИН" variant="outlined"></v-text-field>
        <v-textarea v-model="requestBody.address" label="Адрес" variant="outlined"></v-textarea>
        <v-select
          v-model="requestBody.organization_id"
          :items="organizationTypes"
          item-title="label"
          item-value="id"
          label="Тип организации"
          variant="outlined"
        ></v-select>
        <v-text-field
          v-model="requestBody.zip_code"
          label="Почтовый индекс"
          variant="outlined"
        ></v-text-field>
        <v-dialog width="700">
          <template v-slot:activator="{ props }">
            <v-text-field
              v-model="regionTitle"
              label="Город и регион"
              placeholder="Выберите"
              v-bind="props"
              variant="outlined"
            ></v-text-field>
          </template>

          <template v-slot:default="{ isActive }">
            <v-card title="Выберите регион">
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
                <div class="d-flex w-100 justify-space-between px-3 pb-3">
                  <v-btn color="primary" variant="flat" @click="chooseRegion(isActive)"
                    >Выбрать
                  </v-btn>
                  <v-btn variant="tonal" @click="isActive.value = false">Отмена</v-btn>
                </div>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
        <v-select
          v-model="requestBody.subscription.period"
          :items="subscriptionTypes"
          item-value="id"
          label="Подписка"
          variant="outlined"
        ></v-select>
        <v-select
          v-model="requestBody.subscription.type"
          :items="subscriptions"
          item-value="id"
          label="Тип подписки"
          variant="outlined"
        ></v-select>
        <v-text-field
          v-model="requestBody.subscription.activated_at"
          label="Дата подключения"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-list-item>

      <v-list-item class="mt-2 mb-6 text-center">
        <v-btn class="mr-10" variant="tonal" @click="organizationDrawer = false">Закрыть</v-btn>
        <v-btn color="primary" variant="flat" @click="sendEdit">Добавить</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <div class="mb-4">
                    <v-img :src="school" class="w-50 mx-auto rounded-circle"></v-img>
                  </div>
                  <div class="text-h6">
                    Тип организации:
                    {{ organization.organization ? organization.organization.label : '' }}
                  </div>
                  <div class="mb-2">
                    <strong>БИН:</strong>
                    {{ organization.description.bin }}
                  </div>
                  <div>
                    <v-chip color="green" variant="flat">Активен</v-chip>
                  </div>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="9">
                  <div>
                    Организация:
                    {{ organization.name }}
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="3">
                      <div>
                        Дата подключения:<br />
                        <strong></strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Почта:<br />
                        <strong></strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Номер телефона:<br />
                        <strong></strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>Индекс:<br />{{ organization.description.zip_code }}</div>
                    </v-col>
                  </v-row>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="3">
                      <div>
                        Подписка:<br />
                        <strong></strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Тип подписки:<br />
                        <strong></strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Регион:<br />
                        <strong>{{ regionName }}</strong>
                      </div>
                    </v-col>
                  </v-row>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="12">
                      Адрес:<br />
                      {{ organization.description.address }}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="3">
                      <v-btn
                        append-icon="mdi-arrow-right"
                        variant="outlined"
                        @click="editOrganization"
                        >Изменить данные
                      </v-btn>
                    </v-col>
                    <v-col cols="4">
                      <v-btn append-icon="mdi-arrow-right" variant="outlined"
                        >Отключить организацию
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-data-table :headers="headers" :items="items">
          <template v-slot:bottom></template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
