<script lang="ts" setup>
import { useAPI } from '@/api'
import { computed, type Ref, ref } from 'vue'
import { useRoute } from 'vue-router'
import HelpButton from '@/components/HelpButton.vue'
import returned from '@/assets/return.svg'
import fileDownload from 'js-file-download'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const api = useAPI()
const route = useRoute()

const show1 = ref(false)
const show2 = ref(false)
const show3 = ref(false)
const passwordForm: Ref<{
  old_password: string
  new_password: string
  new_password_confirmation: string
}> = ref({
  old_password: '',
  new_password: '',
  new_password_confirmation: ''
})
const subscriptionStatus = ref(1);
const showAdditionalData2 = ref(false)

interface UserInfo {
  id: number
  login: string
  activated_at: string
  school: {
    id: number
    name: string
  }
  user_data: {
    firstname: string
    lastname: string
    fathername: string | null
    phone: string
    document_ID: string
    nationality: { id: number; title: string }
  }
}

const changePassword = async (isActive: Ref<boolean>) => {
  const response = await api.patchData('/v1/user/password/change', passwordForm.value)
  isActive.value = false
  passwordForm.value = {
    old_password: '',
    new_password: '',
    new_password_confirmation: ''
  }
}

const headers = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: t('book') },
  { key: 'activity', title: t('activity') },
  { key: 'actions', title: t('actions') }
]

const items = [
  { id: 1, name: 'The Life and Diaries of Anne Frank', activity: 1 },
  { id: 40, name: 'The Life and Diaries of Anne Frank', activity: 2 }
]

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

const userInfo: Ref<UserInfo | null> = ref(null)
const showDocument: Ref<boolean> = ref(false)
const documentHidden = computed(() => {
  let value = ''
  if (userInfo.value && userInfo.value.user_data.document_ID) {
    value = userInfo.value.user_data.document_ID
    value = value.substring(0, 4) + '********'
  }
  return value
})

const subscription = ref([])

async function getSubscription() {
  try {
    const response = await api.fetchData(`/v1/subscription/user/${route.params.id}`)
    if (response.data) subscription.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const sendUpdate = async () => {
  if (userInfo.value) {
    const responseBody = {
      document_ID: userInfo.value.user_data.document_ID,
      firstname: userInfo.value.user_data.firstname,
      lastname: userInfo.value.user_data.lastname,
      fathername: userInfo.value.user_data.fathername,
      sex: userInfo.value.user_data.sex,
      birthday: userInfo.value.user_data.birthday,
      email: userInfo.value.email,
      phone: userInfo.value.user_data.phone,
      role_id: userInfo.value.roles[0].id
    }

    await api.putData(`/v1/user/${route.params.id}`, responseBody)
    editDrawer.value = false
  }
}

const newDate = ref('')

const changeDate = async (subscriptionId) => {
  try {
    const returnDateBody = {
      subscription_id: subscriptionId,
      return_date: formatDate(newDate.value)
    }

    if (requestAmount.value && requestAmount.value > 0) {
      returnDateBody['amount'] = requestAmount.value
    }

    if (quarter.value) {
      returnDateBody['quarter'] = quarter.value
    }

    await api.putData('/v1/subscription/return-date', returnDateBody)
  } catch (e) {
    console.error('Error:', e)
  }
}

const downloadFile = async () => {
  const response = await api.postData(
    `/v1/subscription/subscription/pdf?user_id=${route.params.id}`,
    null,
    true
  )
  if (response.data) fileDownload(response.data, 'subscriptions.pdf')
}

async function getUser() {
  try {
    const response = await api.fetchData<UserInfo>(`/v1/user/${route.params.id}`)
    userInfo.value = response.data
  } catch (error) {
    console.log('Error:', error)
  }
}

const requestDrawer = ref(false)
const returnDrawer = ref(false)
const editDrawer = ref(false)
const showAdditionalData = ref(false)
const isAdditional = ref(false)
const addStructure = ref(false)
const addContactPerson = ref(false)
const requestAmount = ref(0)
const quarter = ref(null)
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

function formatDate(dateToFormat: string) {
  const parts = dateToFormat.split('-')
  const year = parts[0]
  const month = parts[1]
  const day = parts[2]

  return `${day}.${month}.${year}`
}

const changeStatus = async (isActive: Ref<boolean>, status: boolean) => {
  await api.putData(`/v1/user/${route.params.id}/status`, {
    status: status ? 0 : 1
  })
  isActive.value = false
  await getUser()
}

const returnBody: Ref<{
  status?: number
  subscription_id: number
  user_id: number
  note: string
  act?: number
  document_id?: number
}> = ref({
  note: '',
  user_id: 0,
  subscription_id: 0
})

const createRequest = async () => {
  try {
    let requestBody
    if (inventoryMode.value === 1) {
      requestBody = {
        user_id: route.params.id,
        book_school_id: selectedInventory.value.id,
        book_inventory_id: selectedUnit.value.id,
        return_date: formatDate(returnDate.value)
      }
    } else {
      requestBody = {
        user_id: route.params.id,
        book_school_id: selectedInventoryNumber.value.book_school_id,
        book_inventory_id: selectedInventoryNumber.value.id,
        return_date: formatDate(returnDate.value)
      }
    }
    requestBody.status = subscriptionStatus.value;

    const response = await api.postData('/v1/subscription/request', requestBody)

    const returnDateBody = {
      subscription_id: response.data.id,
      return_date: formatDate(returnDate.value)
    }

    if (requestAmount.value && requestAmount.value > 0) {
      returnDateBody['amount'] = requestAmount.value
    }

    if (quarter.value) {
      returnDateBody['quarter'] = quarter.value
    }

    await api.putData('/v1/subscription/return-date', returnDateBody)

    await getSubscription()

    requestDrawer.value = false
  } catch (e) {
    alert(e)
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

const result = ref({ requests: Number, returns: Number })

async function getResult() {
  try {
    const response = await api.fetchData(`/v1/subscription/result/${route.params.id}`)
    if (response.data) {
      result.value = response.data
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const inventory = ref([])

const selectedInventory = ref(null)
const selectedUnit = ref(null)
const returnDate = ref(null)
const bookStates: Ref<any[]> = ref([])

const getBookStates = async () => {
  try {
    const response = await api.fetchData<{ data: { items: any[] } }>('/v1/book/state')
    if (response.data) bookStates.value = response.data.data.items
  } catch (e) {
    console.error('Error:', e)
  }
}

const getInventory = async () => {
  try {
    const response = await api.fetchData('/v1/book/school?book_inventory=1')
    if (response.data) {
      inventory.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const inventoryNumbers = computed(() => {
  const inventoryNumber: any[] = []
  inventory.value.forEach((item) => {
    item.book_inventory.forEach((inv) => {
      inventoryNumber.push(inv)
    })
  })
  return inventoryNumber;
})

const activateReturn = (id: number) => {
  returnBody.value.subscription_id = id
  returnDrawer.value = true
}

const makeReturn = async () => {
  try {
    const requestBody = {
      book_state_id: 1,
      subscription_id: returnBody.value.subscription_id,
      user_id: route.params.id
    }
    if (returnBody.value.note.length > 0) requestBody.note = returnBody.value.note
    await api.postData('/v1/subscription/return', requestBody)
    await getSubscription()
    returnDrawer.value = false
  } catch (e) {
    console.error('Error:', e)
  }
}

const downloadCard = async () => {
  if (userInfo.value) {
    const response = await api.postData(`/v1/user/sign-up/pdf/${userInfo.value.id}`)
    if (response.data) {
      const link = document.createElement('a')
      link.href = `${import.meta.env.VITE_APP_API}/storage${response.data.path}`
      link.target = '_blank'
      link.download = 'Карточка доступа.pdf'
      link.click()
      document.body.removeChild(link)
    }
  }
}



const inventoryMode = ref(1);
const selectedInventoryNumber = ref(null);

getUser()
getRoles()
getRelatives()
getSubscription()
getResult()
getInventory()
getBookStates()
</script>

<template>
  <v-container fluid>
    <v-navigation-drawer v-model="requestDrawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">{{t('issue_of_book')}}</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-radio-group color="primary" v-model="inventoryMode" inline>
          <v-radio label="Выдача по книге" :value="1"></v-radio>
          <v-radio label="Выдача по инвенту" :value="2"></v-radio>
        </v-radio-group>
      </v-list-item>
      <v-list-item v-if="inventoryMode === 1">
        <v-autocomplete
          v-model="selectedInventory"
          :items="inventory"
          class="mt-4"
          item-title="book.title"
          :label="t('book')"
          return-object
          variant="outlined"
        ></v-autocomplete>
      </v-list-item>
      <v-list-item v-if="inventoryMode === 1">
        <v-autocomplete
          v-model="selectedUnit"
          :disabled="!selectedInventory"
          :items="selectedInventory ? selectedInventory.book_inventory : []"
          class="mt-2"
          item-title="inventory"
          label="Инвентарь"
          return-object
          variant="outlined"
        ></v-autocomplete>
      </v-list-item>
      <v-list-item v-if="inventoryMode === 2">
        <v-autocomplete
          v-model="selectedInventoryNumber"
          :items="inventoryNumbers"
          class="mt-2"
          item-title="inventory"
          label="Инвентарь"
          return-object
          variant="outlined"
        ></v-autocomplete>
      </v-list-item>
      <v-list-item>
        <v-radio-group color="primary" v-model="subscriptionStatus" inline>
          <v-radio label="На выдаче" :value="1"></v-radio>
          <v-radio label="Читательский зал" :value="5"></v-radio>
        </v-radio-group>
      </v-list-item>
      <v-list-item>
        <v-text-field
          v-model="returnDate"
          class="mt-4"
          :label="t('return_date')"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-list-item>
      <v-list-item>
        <v-btn
          :append-icon="showAdditionalData ? 'mdi-minus' : 'mdi-plus'"
          class="mt-2"
          color="primary"
          variant="text"
          @click="showAdditionalData = !showAdditionalData"
          >{{t('extended_data')}}
        </v-btn>
      </v-list-item>
      <v-list-item v-if="showAdditionalData">
        <v-select
          v-model="quarter"
          :items="[
            { value: 1, title: '1 четверть' },
            { value: 2, title: '2 четверть' },
            { value: 3, title: '3 четверть' },
            { value: 4, title: '4 четверть' },
            { value: 5, title: 'Мероприятия' },
            { value: 6, title: 'Открытый урок' }
          ]"
          class="mt-4"
          clearable
          label="Четверть (необязательно)"
          variant="outlined"
        >
        </v-select>
      </v-list-item>
      <v-list-item v-if="showAdditionalData">
        <v-text-field
          v-model="requestAmount"
          class="mt-2"
          label="Количество (необязательно)"
          type="number"
          variant="outlined"
        ></v-text-field>
      </v-list-item>
      <v-list-item class="mt-3">
        <v-btn class="mr-3" variant="tonal" @click="requestDrawer = false">{{t('close')}}</v-btn>
        <v-btn color="primary" variant="flat" @click="createRequest">Выдача</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="returnDrawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">Возврат книги</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-row class="d-flex align-center">
          <v-col cols="9">
            <v-select
              v-model="returnBody.status"
              :items="bookStates"
              class="mt-4"
              item-value="id"
              :label="t('book_condition')"
              variant="outlined"
            ></v-select>
          </v-col>
          <v-col class="d-flex" cols="3">
            <v-switch
              v-model="isAdditional"
              class="my-auto"
              color="primary"
              label="Другое"
            ></v-switch>
          </v-col>
        </v-row>
      </v-list-item>
      <v-list-item>
        <v-text-field
          :disabled="!isAdditional"
          class="mt-2"
          label="Другое"
          variant="outlined"
        ></v-text-field>
      </v-list-item>
      <v-list-item>
        <v-text-field
          class="mt-4"
          :label="t('return_date')"
          type="date"
          variant="outlined"
        ></v-text-field>
      </v-list-item>
      <v-list-item>
        <v-row>
          <v-col cols="8">
            <v-text-field label="Номер акта" variant="outlined"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-file-input label="Акты" variant="outlined"></v-file-input>
          </v-col>
        </v-row>
      </v-list-item>
      <v-list-item>
        <v-textarea
          v-model="returnBody.note"
          class="mt-2"
          label="Дополнительная заметка"
          variant="outlined"
        ></v-textarea>
      </v-list-item>
      <v-list-item>
        <v-btn variant="tonal" @click="returnDrawer = false">{{t('close')}}</v-btn>
        <v-btn class="ml-2" color="primary" variant="flat" @click="makeReturn">Возврат</v-btn>
      </v-list-item>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="editDrawer" location="right" temporary width="600">
      <v-list-item>
        <span class="font-weight-bold">Редактировать</span>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item class="my-2">
        <span class="font-weight-bold">{{t('basic')}}</span>
      </v-list-item>

      <v-list-item>
        <v-form v-if="userInfo" class="mt-4">
          <v-text-field
            v-model="userInfo.user_data.document_ID"
            :label="t('iin')"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-if="userInfo.user_data"
            v-model="userInfo.user_data.lastname"
            label="Фамилия"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="userInfo.user_data.firstname"
            label="Имя"
            variant="outlined"
          ></v-text-field>
          <v-text-field
            v-model="userInfo.user_data.fathername"
            label="Отчество (необязательно)"
            variant="outlined"
          ></v-text-field>
          <v-autocomplete
            v-model="userInfo.roles[0]"
            :items="roles"
            item-title="label"
            item-value="id"
            :label="t('role')"
            return-object
            variant="outlined"
          ></v-autocomplete>
        </v-form>
      </v-list-item>

      <v-list-item>
        <v-btn
          :append-icon="showAdditionalData2 ? 'mdi-minus' : 'mdi-plus'"
          color="primary"
          :text="t('extended_data')"
          variant="text"
          @click="showAdditionalData2 = !showAdditionalData2"
        ></v-btn>
      </v-list-item>

      <v-list-item v-if="showAdditionalData2">
        <div class="d-flex mt-4 align-center">
          <v-text-field
            v-model="userInfo.user_data.birthday"
            :label="t('date_of_birth')"
            type="date"
            variant="outlined"
          ></v-text-field>
          <v-radio-group v-model="userInfo.user_data.sex" class="ml-4" color="primary" inline>
            <v-radio :value="1" :label="t('male')"></v-radio>
            <v-radio :value="2" :label="t('female')"></v-radio>
          </v-radio-group>
        </div>
        <div class="d-flex mt-4 align-center">
          <v-text-field v-model="userInfo.email" label="Email" variant="outlined"></v-text-field>
          <v-text-field
            v-model="userInfo.user_data.phone"
            class="ml-4"
            :label="t('phone_number')"
            variant="outlined"
            @input="formatPhoneNumber"
          ></v-text-field>
        </div>
        <v-switch
          v-model="addContactPerson"
          color="primary"
          label="Добавить контактное лицо"
        ></v-switch>
        <v-switch v-model="addStructure" color="primary" :label="t('structure')"></v-switch>
      </v-list-item>

      <v-list-item v-if="addContactPerson">
        <div class="font-weight-bold">Контакное лицо</div>
        <v-text-field label="Имя" variant="outlined"></v-text-field>
        <v-text-field label="Фамилия" variant="outlined"></v-text-field>
        <div class="d-flex">
          <v-text-field :label="t('phone_number')" type="tel" variant="outlined"></v-text-field>
          <v-autocomplete
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
        <div class="font-weight-bold">{{t('structure')}}</div>
        <div class="d-flex">
          <v-text-field label="Цифра класса" variant="outlined"></v-text-field>
          <v-text-field class="ml-4" label="Буква класса" variant="outlined"></v-text-field>
        </div>
      </v-list-item>

      <v-list-item class="mt-2 mb-6 text-center">
        <v-btn class="mr-10" variant="tonal" @click="editDrawer = false">{{t('close')}}</v-btn>
        <v-btn color="primary" variant="flat" @click="sendUpdate">{{t('add')}}</v-btn>
      </v-list-item>
    </v-navigation-drawer>
    <v-app-bar>
      <v-btn :to="{ name: 'users' }" prepend-icon="mdi-arrow-left" variant="text"
        >Назад к списку
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn class="mr-3" variant="tonal" @click="downloadFile">Скачать формуляр</v-btn>
      <v-btn class="mr-3" color="primary" variant="flat" @click="requestDrawer = true"
        >{{t('issue_book')}}
      </v-btn>
      <help-button></help-button>
    </v-app-bar>

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
                    <strong>{{t('iin')}}:</strong>
                    {{ showDocument ? userInfo?.user_data.document_ID : documentHidden }}
                    <v-icon
                      :icon="showDocument ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                      @click="showDocument = !showDocument"
                    ></v-icon>
                  </div>
                  <div>
                    <v-chip color="green" variant="flat">{{t('active')}}</v-chip>
                  </div>
                  <div class="mt-4">{{t('issued')}}: 1</div>
                  <div>{{t('returned')}}: 1</div>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="9">
                  <div>
                    {{t('institution')}}:
                    <strong>{{ userInfo?.school?.name }}</strong>
                  </div>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="3">
                      <div>
                        {{t('date_of_birth')}}:<br />
                        <strong>{{ userInfo?.user_data.birthday }}</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        {{t('mail')}}:<br />
                        <strong>{{ userInfo?.email }}</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        {{t('phone_number')}}:<br />
                        <strong>{{ userInfo?.user_data.phone }}</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        {{t('gender')}}:<br />
                        <strong v-if="userInfo?.user_data.sex && userInfo?.user_data.sex === 1"
                          >Мужской</strong
                        >
                        <strong v-else>Женский</strong>
                      </div>
                    </v-col>
                  </v-row>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="3">
                      <div>
                        {{t('role')}}:<br />
                        <strong>{{ userInfo?.roles.map((obj) => obj.label).join(', ') }}</strong>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div>
                        Логин:<br />
                        <strong>{{ userInfo?.login }}</strong>
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <v-btn
                        append-icon="mdi-chevron-right"
                        color="primary"
                        variant="text"
                        @click="downloadCard"
                      >
                        {{t('download_access_card')}}
                      </v-btn>
                      <span>03.05.2024</span>
                    </v-col>
                  </v-row>
                  <v-divider class="my-2"></v-divider>
                  <v-row>
                    <v-col cols="4">
                      <v-dialog max-width="500">
                        <template v-slot:activator="{ props }">
                          <v-btn append-icon="mdi-arrow-right" v-bind="props" variant="outlined"
                            >{{t('change_password')}}
                          </v-btn>
                        </template>

                        <template v-slot:default="{ isActive }">
                          <v-card>
                            <v-card-title>
                              <div class="d-flex justify-space-between">
                                <span class="font-weight-bold">{{t('change_password')}}</span>
                                <v-btn
                                  icon="mdi-close"
                                  variant="text"
                                  @click="isActive.value = false"
                                ></v-btn>
                              </div>
                            </v-card-title>

                            <v-card-text>
                              <v-text-field
                                v-model="passwordForm.old_password"
                                :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                :type="show1 ? 'text' : 'password'"
                                :label="t('old_password')"
                                variant="outlined"
                                @click:append-inner="show1 = !show1"
                              ></v-text-field>
                              <v-text-field
                                v-model="passwordForm.new_password"
                                :append-inner-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                                :type="show2 ? 'text' : 'password'"
                                :label="t('new_password')"
                                variant="outlined"
                                @click:append-inner="show2 = !show2"
                              ></v-text-field>
                              <v-text-field
                                v-model="passwordForm.new_password_confirmation"
                                :append-inner-icon="show3 ? 'mdi-eye' : 'mdi-eye-off'"
                                :type="show3 ? 'text' : 'password'"
                                :label="t('confirm_password')"
                                variant="outlined"
                                @click:append-inner="show3 = !show3"
                              ></v-text-field>
                            </v-card-text>

                            <v-card-actions class="pl-6 pb-4">
                              <v-btn variant="tonal" @click="isActive.value = false">{{t('close')}}</v-btn>
                              <v-btn
                                color="primary"
                                variant="flat"
                                @click="changePassword(isActive)"
                                >{{t('edit')}}
                              </v-btn>
                            </v-card-actions>
                          </v-card>
                        </template>
                      </v-dialog>
                    </v-col>
                    <v-col cols="4">
                      <v-btn
                        append-icon="mdi-arrow-right"
                        variant="outlined"
                        @click="editDrawer = true"
                        >{{t('edit_data')}}
                      </v-btn>
                    </v-col>
                    <v-col cols="4">
                      <v-dialog max-width="600">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-if="userInfo && userInfo.status"
                            append-icon="mdi-arrow-right"
                            v-bind="props"
                            variant="outlined"
                            >{{t('disable_user')}}
                          </v-btn>
                          <v-btn
                            v-if="userInfo && !userInfo.status"
                            append-icon="mdi-arrow-right"
                            v-bind="props"
                            variant="outlined"
                            >{{t('activate_user')}}
                          </v-btn>
                        </template>

                        <template v-slot:default="{ isActive }">
                          <v-card class="py-4">
                            <v-card-title>
                              <v-row>
                                <v-col cols="12">
                                  <div class="d-flex justify-center">
                                    <v-icon
                                      color="red"
                                      icon="mdi-alert-circle-outline"
                                      size="x-large"
                                    ></v-icon>
                                  </div>
                                </v-col>
                              </v-row>
                              <v-row>
                                <v-col class="text-center" cols="12">
                                  <span v-if="userInfo && userInfo.status" class="font-weight-bold"
                                    >{{t('disable_user')}}</span
                                  >
                                  <span v-if="userInfo && !userInfo.status" class="font-weight-bold"
                                    >{{t('activate_user')}}</span
                                  >
                                </v-col>
                              </v-row>
                            </v-card-title>

                            <v-card-text v-if="userInfo && userInfo.status" class="text-center">
                              Вы уверены что хотите отключить пользователя от системы QAZAQMURA? Вся
                              история останется в системе
                            </v-card-text>
                            <v-card-text v-else class="text-center">
                              Вы уверены что хотите активировать пользователя в системе QAZAQMURA?
                            </v-card-text>

                            <v-card-actions>
                              <div class="d-flex w-100">
                                <v-btn
                                  class="ml-auto mr-4"
                                  color="primary"
                                  variant="flat"
                                  @click="changeStatus(isActive, userInfo.status)"
                                  >{{
                                    userInfo && userInfo.status
                                      ? 'Да, отключить'
                                      : 'Да, активировать'
                                  }}
                                </v-btn>
                                <v-btn
                                  class="mr-auto"
                                  variant="tonal"
                                  @click="isActive.value = false"
                                  >Отмена
                                </v-btn>
                              </div>
                            </v-card-actions>
                          </v-card>
                        </template>
                      </v-dialog>
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
        <v-data-table :headers="headers" :items="subscription">
          <template v-slot:[`item.name`]="{ item }">
            <div class="mt-2">{{ item.book.title }}</div>
            <div class="text-medium-emphasis mt-2">{{t('year_of_publication')}}: {{ item.book.year }}</div>
            <div class="my-2">
              <v-chip
                v-for="author in item.book.book_author_main"
                :ley="author.id"
                color="primary"
                variant="outlined"
                >{{ author.name }}
              </v-chip>
            </div>
            <div class="my-2">
              <v-chip
                v-for="publisher in item.book.book_publisher"
                :key="publisher.id"
                color="green"
                variant="flat"
              >
                {{t('publisher')}}: {{ publisher.title }}
              </v-chip>
            </div>
          </template>
          <template v-slot:[`item.activity`]="{ item }">
            <div class="mb-2">
              <v-chip v-if="item.status === 'return'" color="primary" variant="outlined"
                >{{  t('returned') }}
              </v-chip>
              <v-chip v-if="item.status === 'request'" color="primary" variant="outlined"
                >  На выдаче 
              </v-chip>
              <v-chip color="primary" variant="outlined" v-if="item.status === 'reader'">Читательский зал</v-chip>
            </div>
            <div>{{t('issue_date')}}: {{ item.created_at }}</div>
            <div>{{t('return_date')}}: {{ item.return_date }}</div>
            <div v-if="item.status == 'return'">Дата возврата в фонд: {{ item.returned_at }}</div>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <div v-if="item.status !== 'return'" class="d-flex flex-column my-2">
              <v-btn color="#384352" variant="flat" @click="activateReturn(item.id)"
                >Сделать возврат
              </v-btn>
              <v-dialog v-if="item.status !== 'reader'" max-width="50vw">
                <template v-slot:activator="{ props }">
                  <v-btn class="mt-2" color="primary" v-bind="props" variant="flat"
                    >Изменить дату
                  </v-btn>
                </template>

                <template v-slot:default="{ isActive }">
                  <v-card>
                    <v-card-title>
                      <div class="d-flex justify-space-between">
                        <span class="font-weight-bold">Изменить дату возврата</span>
                        <v-btn
                          icon="mdi-close"
                          variant="text"
                          @click="isActive.value = false"
                        ></v-btn>
                      </div>
                    </v-card-title>

                    <v-card-text>
                      <div class="d-flex justify-space-between">
                        <v-text-field label="С:" type="date" variant="outlined"></v-text-field>
                        <v-text-field
                          v-model="newDate"
                          class="ml-4"
                          label="До:"
                          type="date"
                          variant="outlined"
                        ></v-text-field>
                      </div>
                    </v-card-text>

                    <v-card-actions class="pb-4">
                      <v-btn class="ml-4 mr-2" variant="tonal" @click="isActive.value = false"
                        >{{t('close')}}
                      </v-btn>
                      <v-btn color="primary" variant="flat" @click="changeDate(item.id)"
                        >{{t('edit')}}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </div>
            <div v-else class="d-flex align-center text-center w-100">
              <img :src="returned" alt="returned" class="mx-auto" width="60" />
            </div>
          </template>
          <template v-slot:bottom></template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>
