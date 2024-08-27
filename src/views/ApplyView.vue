<script lang="ts" setup>
import logo from '@/assets/logo.svg'
import { type Ref, ref, watch } from 'vue'
import { useAPI } from '@/api'
import complete from '@/assets/complete.svg'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
const step = ref(1)
const api = useAPI()
const organization = ref({
  bin: '',
  address: '',
  email: '',
  phone: '',
  postIndex: '',
  title: ''
})

const responsiblePerson = ref({
  email: '',
  fathername: '',
  lastname: '',
  name: '',
  phone: '',
  position: ''
})

const library = ref({
  ID: '',
  email: '',
  fathername: '',
  lastname: '',
  name: '',
  phone: ''
})

const formatPhoneNumber = (entity: 'organization' | 'responsiblePerson' | 'library') => {
  let formatted = ''
  if (entity === 'organization') formatted = organization.value.phone.replace(/\D/g, '')
  else if (entity === 'responsiblePerson')
    formatted = responsiblePerson.value.phone.replace(/\D/g, '')
  else formatted = library.value.phone.replace(/\D/g, '')

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

  if (entity === 'organization') organization.value.phone = formatted
  else if (entity === 'responsiblePerson') responsiblePerson.value.phone = formatted
  else library.value.phone = formatted
}

const getEntries = (item: object) => {
  const entries = Object.entries(item)
  const orderedEntries = []
  const remainingEntries = []

  const keysOrder = ['lastname', 'name', 'fathername']

  entries.forEach(([key, value]) => {
    if (keysOrder.includes(key)) {
      orderedEntries.push([key, value])
    } else {
      remainingEntries.push([key, value])
    }
  })

  orderedEntries.push(...remainingEntries)

  return orderedEntries
}

const goToMain = () => {
  window.location.href = 'https://qazaqmura.kz'
}

const getTitle = (key: string) => {
  switch (key) {
    case 'title':
      return 'Полное название организации'
    case 'bin':
      return 'БИН'
    case 'phone':
      return 'Телефон'
    case 'address':
      return 'Адрес школы'
    case 'city':
      return 'Город и регион'
    case 'postIndex':
      return 'Почтовый индекс'
    case 'lastname':
      return 'Фамилия'
    case 'name':
      return 'Имя'
    case 'fathername':
      return 'Отчество'
    case 'position':
      return 'Должность'
    case 'email':
      return 'Электронная почта'
    case 'ID':
      return t('iin')
    default:
      return ''
  }
}

const snackbar = ref(false)
const snackbarError = ref(false)
const snackbarText = ref('')

const checkID = async () => {
  try {
    const response = await api.postData('/v1/online/apply/bin', {
      id: organization.value.bin
    })
    if (response.data.success) {
      snackbarText.value = response.data.message
      snackbar.value = true
      return true
    }
  } catch (e) {
    snackbarText.value = e
    snackbar.value = true
    snackbarError.value = true
  }
  return false
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

const sendApply = async () => {
  try {
    if (await checkID()) {
      await api.postData('/v1/online/apply', {
        organization: {
          ID: organization.value.bin,
          address: organization.value.address,
          email: organization.value.email,
          phone: organization.value.phone,
          postIndex: organization.value.postIndex,
          title: organization.value.title
        },
        responsiblePerson: {
          email: responsiblePerson.value.email,
          fathername: responsiblePerson.value.fathername,
          lastname: responsiblePerson.value.lastname,
          name: responsiblePerson.value.name,
          phone: responsiblePerson.value.phone,
          position: responsiblePerson.value.position
        },
        library: {
          ID: library.value.ID,
          email: library.value.email,
          fathername: library.value.fathername,
          lastname: library.value.lastname,
          name: library.value.name,
          phone: library.value.phone
        },
        regionId: regionId.value
      })
    step.value++
  }
  } catch (e) {
    snackbar.value = true
    snackbarText.value = e.message
    snackbarError.value = true
  }
}

getRegions()
</script>

<template>
  <v-container fluid>
    <v-snackbar v-model="snackbar" :color="snackbarError ? 'red' : 'primary'" :timeout="3000">{{ snackbarText }}
    </v-snackbar>
    <v-app-bar>
      <v-app-bar-title>
        <v-img :src="logo" :width="180" alt="logo" class="ml-6"></v-img>
      </v-app-bar-title>
    </v-app-bar>

    <v-row>
      <v-col class="pb-10" cols="6" offset="3">
        <v-row>
          <v-col cols="12">
            <div class="text-h5 font-weight-bold text-center">
              Заполните онлайн заявку, состоящую из 3-х разделов
            </div>
            <div class="text-medium-emphasis text-center">
              Пожалуйста, внимательно прочитайте инструкции для заполнения формы прежде, чем вы
              приступите к ее непосредственному заполнению. Тщательно изучите поля онлайн заявки,
              требующие заполнения. Подготовьте заранее всю необходимую информацию.
            </div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-stepper v-model="step" :items="['1', '2', '3', '4', '5']" class="rounded-lg" color="primary" mobile
              next-text="Следующий" prev-text="Предыдущий">
              <template v-slot:[`item.1`]>
                <div class="font-weight-bold text-h6">Данные организации</div>
                <v-form class="mt-4">
                  <v-text-field v-model="organization.title" label="Полное название организации"
                    placeholder="Напишите название" variant="outlined"></v-text-field>
                  <v-text-field v-model="organization.bin" label="БИН" placeholder="БИН" variant="outlined">
                    <template v-slot:append-inner>
                      <v-btn color="primary" variant="flat" @click="checkID">Проверить БИН</v-btn>
                    </template>
                  </v-text-field>
                  <v-text-field v-model="organization.phone" label="Номер телефона организации"
                    placeholder="Напишите номер" variant="outlined"
                    @input="formatPhoneNumber('organization')"></v-text-field>
                  <v-text-field v-model="organization.email" label="Электронная почта организации"
                    placeholder="Напишите почту" variant="outlined"></v-text-field>
                  <v-text-field v-model="organization.address" label="Адрес организации" placeholder="Напишите адрес"
                    variant="outlined"></v-text-field>
                  <v-dialog width="700">
                    <template v-slot:activator="{ props }">
                      <v-text-field v-model="regionTitle" label="Город и регион" placeholder="Выберите" v-bind="props"
                        variant="outlined"></v-text-field>
                    </template>

                    <template v-slot:default="{ isActive }">
                      <v-card title="Выберите регион">
                        <v-card-text>
                          <v-select v-model="parentRegion" :items="parentRegions" item-value="id" label="Регион"
                            placeholder="Выберите регион" return-object variant="outlined"></v-select>
                          <v-select v-if="childrenRegions.length > 0" v-model="childRegion" :items="childrenRegions"
                            item-value="id" label="Регион" placeholder="Выберите регион" return-object
                            variant="outlined"></v-select>
                          <v-select v-if="thirdRegions.length > 0" v-model="thirdRegion" :items="thirdRegions"
                            item-value="id" label="Регион" placeholder="Выберите регион" return-object
                            variant="outlined"></v-select>
                        </v-card-text>
                        <v-card-actions>
                          <div class="d-flex w-100 justify-space-between px-3 pb-3">
                            <v-btn color="primary" variant="flat" @click="chooseRegion(isActive)">Выбрать
                            </v-btn>
                            <v-btn variant="tonal" @click="isActive.value = false">Отмена</v-btn>
                          </div>
                        </v-card-actions>
                      </v-card>
                    </template>
                  </v-dialog>

                  <v-text-field v-model="organization.postIndex" label="Почтовый индекс" placeholder="Напишите индекс"
                    variant="outlined"></v-text-field>
                </v-form>
              </template>

              <template v-slot:[`item.2`]>
                <div class="font-weight-bold text-h6">Директор или бухгалтер</div>
                <v-form class="mt-4">
                  <v-text-field v-model="responsiblePerson.lastname" label="Фамилия" placeholder="Напишите фамилию"
                    variant="outlined"></v-text-field>
                  <v-text-field v-model="responsiblePerson.name" label="Имя" placeholder="Напишите имя"
                    variant="outlined">
                  </v-text-field>
                  <v-text-field v-model="responsiblePerson.fathername" label="Отчество" placeholder="Напишите отчество"
                    variant="outlined"></v-text-field>
                  <v-text-field v-model="responsiblePerson.position" label="Должность" placeholder="Напишите должность"
                    variant="outlined"></v-text-field>
                  <v-text-field v-model="responsiblePerson.phone" :label="t('phone_number')"
                    placeholder="Напишите номер" variant="outlined"
                    @input="formatPhoneNumber('responsiblePerson')"></v-text-field>
                  <v-text-field v-model="responsiblePerson.email" label="Электронная почта" placeholder="Напишите почту"
                    variant="outlined"></v-text-field>
                </v-form>
              </template>

              <template v-slot:[`item.3`]>
                <div class="font-weight-bold text-h6">Данные библиотекаря</div>
                <v-form class="mt-4">
                  <v-text-field v-model="library.lastname" label="Фамилия" placeholder="Напишите фамилию"
                    variant="outlined"></v-text-field>
                  <v-text-field v-model="library.name" label="Имя" placeholder="Напишите имя" variant="outlined">
                  </v-text-field>
                  <v-text-field v-model="library.fathername" label="Отчество" placeholder="Напишите отчество"
                    variant="outlined"></v-text-field>
                  <v-text-field v-model="library.ID" :label="t('iin')" variant="outlined"></v-text-field>
                  <v-text-field v-model="library.phone" :label="t('phone_number')" placeholder="Напишите номер"
                    variant="outlined" @input="formatPhoneNumber('library')"></v-text-field>
                  <v-text-field v-model="library.email" label="Электронная почта" placeholder="Напишите почту"
                    variant="outlined"></v-text-field>
                </v-form>
              </template>
              <template v-slot:[`item.4`]>
                <div class="font-weight-bold text-h6">Данные для отправки</div>
                <div class="border rounded mt-3 py-2 px-3">
                  <div class="font-weight-bold text-h6">Данные организации</div>
                  <v-data-table :items="[...getEntries(organization), ['city', regionTitle]]">
                    <template v-slot:headers></template>
                    <template v-slot:bottom></template>
                    <template v-slot:[`item.0`]="{ item }">{{ getTitle(item[0]) }}</template>
                  </v-data-table>
                </div>
                <div class="border rounded mt-3 py-2 px-3">
                  <div class="font-weight-bold text-h6">Директор или бухгалтер</div>
                  <v-data-table :items="getEntries(responsiblePerson)">
                    <template v-slot:headers></template>
                    <template v-slot:bottom></template>
                    <template v-slot:[`item.0`]="{ item }">{{ getTitle(item[0]) }}</template>
                  </v-data-table>
                </div>
                <div class="border rounded mt-3 py-2 px-3">
                  <div class="font-weight-bold text-h6">Данные библиотекаря</div>
                  <v-data-table :items="getEntries(library)">
                    <template v-slot:headers></template>
                    <template v-slot:bottom></template>
                    <template v-slot:[`item.0`]="{ item }">{{ getTitle(item[0]) }}</template>
                  </v-data-table>
                </div>
              </template>

              <template v-slot:[`item.5`]>
                <div class="w-100 mt-10 text-center justify-center">
                  <v-img :src="complete" class="mx-auto mb-2" width="144"></v-img>
                  <div class="text-h6 font-weight-bold">Ваш запрос принять</div>
                  <div class="mx-16 mt-3 mb-8">
                    Если вся информация, которую вы ранее ввели на предыдущих шагах правильная, то с
                    вами свяжется менеджер
                  </div>
                </div>
              </template>

              <template v-slot:actions>
                <div class="d-flex w-100 px-6 pb-10">
                  <v-btn v-if="step > 1 && step !== 5" color="primary" variant="outlined" @click="step--">Предыдущий
                  </v-btn>
                  <v-btn v-if="step < 4" class="ml-auto" color="primary" @click="step++">Следующий
                  </v-btn>
                  <v-btn v-else-if="step === 4" class="ml-auto" color="primary" @click="sendApply">{{ t('send') }}
                  </v-btn>
                  <v-btn v-else class="mx-auto" color="primary" @click="goToMain">На главную
                  </v-btn>
                </div>
              </template>
            </v-stepper>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
