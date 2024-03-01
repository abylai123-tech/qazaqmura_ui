<script setup lang="ts">
import { useAPI } from '@/api';
import { ref, type Ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const api = useAPI()
const route = useRoute()

interface UserInfo {
  id: number,
  login: string,
  activated_at: string,
  user_data: {
    firstname: string,
    lastname: string,
    fathername: string | null,
    phone: string,
    document_ID: string,
    nationality: { id: number, title: string }
  }
}

const headers = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: 'Книга' },
  { key: 'activity', title: 'Активность' },
  { key: 'actions', title: 'Действия' }
]

const items = [
  { id: 1, name: 'The Life and Diaries of Anne Frank', activity: 1 },
  { id: 40, name: 'The Life and Diaries of Anne Frank', activity: 2 }
]

const userInfo: Ref<UserInfo | null> = ref(null);
const showDocument: Ref<boolean> = ref(false)
const documentHidden = computed(() => {
  let value = ''
  if (userInfo.value) {
    value = userInfo.value.user_data.document_ID
    value = value.substring(0, 4) + '********';
  }
  return value
})

async function getUser() {
  try {
    const response = await api.fetchData<UserInfo>(`https://test.api.qazaqmura.kz/v1/user/${route.params.id}`);
    userInfo.value = response.data
  } catch (error) {
    console.log('Error:', error)
  }
}

getUser()
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col cols="3">
                  <div class="text-h6 font-weight-bold">
                    {{ userInfo?.user_data.firstname }} {{ userInfo?.user_data.lastname }}
                    {{ userInfo?.user_data.fathername }}
                  </div>
                  <div>
                    <strong>ИИН:</strong>
                    {{ showDocument ? userInfo?.user_data.document_ID : documentHidden }}
                    <v-icon @click="showDocument = !showDocument"
                      :icon="showDocument ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"></v-icon>
                  </div>
                  <div>
                    <v-chip color="green" variant="flat">Активен</v-chip>
                  </div>
                  <div class="mt-4">Выдано: 1</div>
                  <div>Возвращено: 1</div>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="9">
                  <div>Учреждение:</div>
                  <div>Название учреждения</div>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="3">
                      <div>
                        Дата рождения:<br />
                        <strong>29/09/2000</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Почта:<br />
                        <strong>test@gmail.com</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Номер телефона:<br />
                        <strong>+7 777 100 7070</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Пол:<br />
                        <strong>Мужской</strong>
                      </div>
                    </v-col>
                  </v-row>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="3">
                      <div>
                        Роль:<br />
                        <strong>Библиотекарь</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Логин:<br />
                        <strong>{{ userInfo?.login }}</strong>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-btn variant="text" color="primary" append-icon="mdi-chevron-right">
                        Скачать карточку доступа
                      </v-btn>
                    </v-col>
                  </v-row>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="4">
                      <v-btn variant="outlined" append-icon="mdi-arrow-right">Изменить пароль</v-btn>
                    </v-col>
                    <v-col cols="4">
                      <v-btn variant="outlined" append-icon="mdi-arrow-right">Изменить данные</v-btn>
                    </v-col>
                    <v-col cols="4">
                      <v-btn variant="outlined" append-icon="mdi-arrow-right">Отключить пользователя</v-btn>
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
          <template v-slot:[`item.actions`]="{ }">
            <div class="d-flex flex-column my-2">
              <v-btn variant="flat" color="#384352">Сделать возврат</v-btn>
              <v-btn variant="flat" color="primary" class="mt-2">Изменить дату</v-btn>
            </div>
          </template>
          <template v-slot:bottom></template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>