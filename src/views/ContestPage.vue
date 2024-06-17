<script setup>
import router from '@/router'
import { ref, watch } from 'vue'
import { useAPI } from '@/api'
import instruction from '@/assets/инструкция по загрузки материалов по.pdf'
import konkurs_ru from '@/assets/konkurs_ru.pdf'
import konkurs_kz from '@/assets/konkurs_kz.pdf'

const api = useAPI()

const parentRegions = ref([])
const childrenRegions = ref([])
const thirdRegions = ref([])
const parentRegion = ref(null)
const childRegion = ref(null)
const thirdRegion = ref(null)
const regionId = ref(null)
const regionTitle = ref('')
const name = ref('')
const school = ref('')
const driveLink = ref('')
const videoLink = ref('')

const goBack = () => {
  router.back()
}

const getRegions = async (parentId = null) => {
  try {
    let request = '/v1/region'
    if (parentId) request += `?parent_id=${parentId}`
    const response = await api.fetchData(request)
    if (response.data) {
      if (parentRegion.value && childRegion.value) thirdRegions.value = response.data.data.items
      else if (parentRegion.value) childrenRegions.value = response.data.data.items
      else parentRegions.value = response.data.data.items
    }
  } catch (e) {
    console.error('Error:', e)
  }
}

const chooseRegion = (isActive) => {
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

const downloadDocument = () => {
  const link = document.createElement('a')
  link.href = konkurs_ru
  link.download = 'Положение (RU).pdf'
  link.click()
  link.href = konkurs_kz
  link.download = 'Положение (KZ).pdf'
  link.click()
  document.body.removeChild(link)
}

const downloadInstruction = () => {
  const link = document.createElement('a')
  link.href = instruction
  link.download = 'Инструкция.pdf'
  link.click()
  document.body.removeChild(link)
}

const alert = ref(false)
const alertText = ref('')
const alertError = ref(false)

const sendContest = async () => {
  const body = {
    content: `ФИО: ${name.value} \nШкола: ${school.value}\nРегион: ${regionTitle.value}\nСсылка на Google Диск: ${driveLink.value}\nСсылка на видел:${videoLink.value}`
  }
  const response = await api.postData('/v1/mail/send', body)
  console.log(response)
}

getRegions()
</script>

<template>
  <v-snackbar
    v-model="alert"
    :color="alertError ? 'red' : 'blue'"
    :text="alertText"
    :timeout="5000"
  ></v-snackbar>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold"
            >Лучший библиотекарь Республики Казахстан 2024 г.</span
          >
          <span class="text-subtitle-2 text-medium-emphasis"
            >Конкурс для библиотекарей школ и колледжей по Республике Казахстан</span
          >
        </div>
      </template>

      <template v-slot:append>
        <v-btn class="mr-3" prepend-icon="mdi-video-outline" variant="tonal">Как заполнять</v-btn>
        <v-btn
          class="mr-3"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="downloadDocument"
          >Скачать положение
        </v-btn>
        <v-btn
          class="mr-3"
          color="primary"
          prepend-icon="mdi-plus"
          variant="flat"
          @click="downloadInstruction"
          >Скачать инструкцию
        </v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="goBack">Назад</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" offset="2">
        <v-card title="Заявка на участие">
          <v-card-text>
            <span class="text-subtitle-2 text-medium-emphasis"
              >Конкурс проводится для библиотекарей школ и колледжей Республики Казахстан с целью
              выявления, поддержки и поощрения эффективно работающих библиотекарей, а также в целях
              популяризации и распространения результативного и инновационного опыта работы
              библиотек общеобразовательных учреждений, использования актуальных цифровых
              инструментов, признания труда современного библиотекаря и повышения престижа
              библиотечной профессии.</span
            >
          </v-card-text>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="name"
                label="ФИО"
                placeholder="Напишите ФИО"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                v-model="school"
                label="Школа"
                placeholder="Напишите название"
                variant="outlined"
              ></v-text-field>
              <v-dialog width="65vw">
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
                        <v-btn
                          icon="mdi-close"
                          variant="text"
                          @click="isActive.value = false"
                        ></v-btn>
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

              <v-text-field
                v-model="driveLink"
                label="Ссылка на Google Диск"
                placeholder="Ссылка"
                variant="outlined"
              ></v-text-field>
              <v-text-field
                v-model="videoLink"
                label="Ссылка на видео"
                placeholder="Ссылка"
                variant="outlined"
              ></v-text-field>
              <!--              <v-text-field label="Номинация" placeholder="Выберите номинацию" variant="outlined"></v-text-field>-->
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="2" offset="8">
        <v-btn block color="green" variant="flat" @click="sendContest">Отправить</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped></style>
