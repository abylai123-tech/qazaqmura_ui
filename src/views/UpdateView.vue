<script setup>
import { computed, ref, watch } from 'vue'
import { useAuth } from '@/auth'
import { useAPI } from '@/api'

const auth = useAuth()
const api = useAPI()

const role = computed(() => {
  return auth.user.value && auth.user.value.roles[0] ? auth.user.value.roles[0].id : 0
})

const news = ref([])
const newsCategories = ref([])
const page = ref(1)
const length = ref(1)
const newUpdate = ref({
  title: '',
  text: '',
  description: '',
  preview: null,
  news_category_id: null,
})
const previewFile = ref(null)

const updateMode = ref(false)

async function getNews() {
  const response = await api.fetchData(`/v1/news?page=${page.value}`)
  if (response.data) {
    news.value = response.data.data.items
    length.value = response.data.meta.last_page
  }
}

async function getNewsCategories() {
  const response = await api.fetchData(`/v1/news/category`)
  if (response.data) {
    newsCategories.value = response.data.data.items
  }
}

async function createUpdate() {
  const formData = new FormData()
  if (previewFile.value) {
    formData.append('preview', previewFile.value[0])
  }
  formData.append('text', newUpdate.value.text)
  formData.append('title', newUpdate.value.title)
  formData.append('description', newUpdate.value.description)
  formData.append('news_category_id', newUpdate.value.news_category_id)

  await api.postData('/v1/news', formData)

  newUpdate.value = {
    text: '',
    title: '',
    description: '',
    news_category_id: null,
  }

  previewFile.value = null

  updateMode.value = false
  getNews()
}

function getPreviewImage(previewFile) {
  return URL.createObjectURL(previewFile[0])
}

function getItemPreview(preview) {
  return `${import.meta.env.VITE_APP_API}/storage/news/${preview}`
}

function getCategoryName(category_id) {
  return newsCategories.value.find(item => { return item.id === category_id }).title
}

getNews()
getNewsCategories()

watch(page, () => getNews())
</script>

<template>
  <v-container class="h-screen">
    <v-app-bar>
      <v-app-bar-title>
        <div class="text-h6 font-weight-bold">Обновления</div>
        <div class="text-subtitle-2 text-medium-emphasis">Новости и обновления по системе</div>
      </v-app-bar-title>

      <template #append>
        <v-responsive v-if="role === 1" max-width="10vw">
          <v-btn
            @click="updateMode = true"
            block
            variant="flat"
            color="primary"
            text="Добавить"
          ></v-btn>
        </v-responsive>
      </template>
    </v-app-bar>

    <v-row>
      <v-col cols="4" v-for="item in news" :key="item.id">
        <v-card>
          <v-img :src="getItemPreview(item.preview)" cover></v-img>
          <v-card-title>
            <div class="font-weight-bold">
              {{ item.title }}
            </div>
            <div>
              <v-chip variant="flat" color="primary">{{ getCategoryName(item.news_category_id) }}</v-chip>
            </div>
          </v-card-title>
          <v-card-text>
            <div>{{ item.text }}</div>
            <div>{{ item.description }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-pagination
          active-color="primary"
          class="ml-auto mr-2"
          size="small"
          variant="flat"
          v-model="page"
          :length="length"
        ></v-pagination>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog max-width="50vw" v-model="updateMode">
    <v-card title="Опубликовать информацию об обновлении">
      <v-img max-height="40vh" v-if="previewFile" :src="getPreviewImage(previewFile)" contain />
      <v-card-text>
        <div class="d-flex ga-4 mb-4">
          <v-text-field
            v-model="newUpdate.title"
            hide-details
            single-line
            variant="outlined"
            label="Название"
          />
          <v-text-field
            v-model="newUpdate.text"
            hide-details
            single-line
            variant="outlined"
            label="Текст"
          />
        </div>
        <div class="d-flex ga-4 mb-4">
          <v-file-input
            accept="image/png, image/jpeg, image/bmp"
            v-model="previewFile"
            hide-details
            single-line
            variant="outlined"
            label="Превью"
          />
          <v-select
            v-model="newUpdate.news_category_id"
            item-value="id"
            :items="newsCategories"
            hide-details
            single-line
            variant="outlined"
            label="Категория"
          />
        </div>
        <div>
          <v-textarea
            v-model="newUpdate.description"
            hide-details
            single-line
            variant="outlined"
            label="Описание"
          ></v-textarea>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          @click="createUpdate"
          class="ml-4 mb-2"
          variant="flat"
          color="primary"
          text="Опубликовать"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
