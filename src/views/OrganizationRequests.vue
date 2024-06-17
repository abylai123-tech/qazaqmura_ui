<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useAPI } from '@/api'

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
    }
  } else {
    this.drawer = false
  }
  await getItems()
}

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
                  <td>ИИН</td>
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
          <v-btn class="mr-2" variant="tonal" @click="drawer = false">Закрыть</v-btn>
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
            { title: 'ФИО:', key: 'initiator' },
            { title: 'Школа', key: 'organization' },
            { title: 'Действия', key: 'actions' }
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
                >Перейти
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
