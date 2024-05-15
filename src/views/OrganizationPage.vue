<script lang="ts" setup>
import { useAPI } from '@/api'
import { useRoute } from 'vue-router'
import HelpButton from '@/components/HelpButton.vue'
import { ref } from 'vue'
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
  description: {}
})

async function getOrganization() {
  try {
    const response = await api.fetchData(`/v1/school/${route.params.id}`)
    organization.value = response.data
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
                        <strong></strong>
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
                      <v-btn append-icon="mdi-arrow-right" variant="outlined"
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
