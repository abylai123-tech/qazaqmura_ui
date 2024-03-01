<script setup lang="ts">
import { useAPI } from '@/api';
import { defineProps, ref, type Ref } from 'vue'

const api = useAPI()

interface Props {
  bottomItems: { label: string, value: number }[],
  oneLine: boolean,
  mdata: boolean,
  inventory: boolean,
  users: boolean
}

interface Item {
  id: number,
  title: string,
}

interface Author {
  id: number,
  name: string,
}

const languages: Ref<Item[]> = ref([])
const authors: Ref<Author[]> = ref([])
const publishers: Ref<Item[]> = ref([])

const props = defineProps<Props>()


async function getLanguages(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/language`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Item[] } }>(request)
    if (response.data) languages.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getAuthors(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/author`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Author[] } }>(request)
    if (response.data) authors.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getPublishers(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/publisher`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Item[] } }>(request)
    if (response.data) publishers.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

if (props.mdata) {
  getLanguages()
  getAuthors()
  getPublishers()
}
</script>

<template>
  <v-card>
    <v-card-text>
      <div class="d-flex flex-column">
        <v-row class="mb-2">
          <v-col class="d-flex" cols="9">
            <v-text-field rounded density="compact" hide-details variant="outlined" prepend-inner-icon="mdi-magnify"
              placeholder="Поиск по названию"></v-text-field>
          </v-col>
          <v-col class="d-flex justify-space-around">
            <v-btn variant="flat" color="primary">Искать</v-btn>
            <v-btn variant="tonal">Сбросить</v-btn>
          </v-col>
        </v-row>
        <v-row class="mb-2">
          <v-col v-if="mdata" cols="2">
            <v-select :items="languages" item-value="id" item-title="title" variant="solo-filled" label="Язык"></v-select>
          </v-col>
          <v-col v-if="mdata || inventory" cols="2">
            <v-autocomplete :items="authors" @update:search="getAuthors" item-title="name" variant="solo-filled"
              label="Автор"></v-autocomplete>
          </v-col>
          <v-col v-if="mdata || inventory" cols="2">
            <v-autocomplete :items="publishers" @update:search="getPublishers" item-title="title" variant="solo-filled"
              label="Издатель"></v-autocomplete>
          </v-col>
          <v-col v-if="mdata" cols="2">
            <v-text-field type="number" variant="solo-filled" label="Год издания"></v-text-field>
          </v-col>
          <v-col v-if="(!mdata && !inventory) || users" cols="2">
            <v-select variant="solo-filled" label="Класс"></v-select>
          </v-col>
          <v-col v-if="users" cols="3">
            <v-select variant="solo-filled" label="Классный руководитель"></v-select>
          </v-col>
          <v-col v-else-if="mdata">
            <v-switch color="primary" label="Электронная книга"></v-switch>
          </v-col>
          <v-col v-if="inventory" cols="2">
            <v-switch color="primary" label="Списанные"></v-switch>
          </v-col>
          <v-col v-if="inventory" cols="3">
            <v-switch color="primary" label="Только книги фонда"></v-switch>
          </v-col>
          <v-col v-if="users" cols="2">
            <v-switch color="primary" label="Не активные"></v-switch>
          </v-col>
          <v-col v-if="users" cols="3">
            <v-switch color="primary" label="Должники"></v-switch>
          </v-col>
        </v-row>
        <v-divider v-if="!oneLine"></v-divider>
        <v-row v-if="!oneLine" class="py-3">
          <v-col class="d-flex">
            <div v-for="item in props.bottomItems" :key="item.label" class="mr-8">
              <div><strong>{{ item.value }}</strong></div>
              <div>
                <span class="text-subtitle-2 text-medium-emphasis">{{ item.label }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>