<script lang="ts" setup>
import { ref, watch, type Ref } from 'vue'
import { useAPI } from '@/api'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
interface Props {
  mode: 'bbk' | 'udk'
}

const componentProps = defineProps<Props>()
const api = useAPI()
const items = ref([])
const getItems = async () => {
  const response = await api.fetchData(`/v1/${componentProps.mode}`)
  if (response.data) {
    items.value = response.data.data.items
  }
}

const childItems = ref([])
const parentItem = ref('')
const selectedItems = ref([])

const selectItem = async (item: { id: any; }) => {
  const response = await api.fetchData(`/v1/${componentProps.mode}?parent_id=${item.id}`)
  if (response.data && response.data.data.items.length > 0) {
    childItems.value.push(response.data.data.items)

    level.value++
  }
}

const level = ref(0)
const emit = defineEmits('finish')
const finishSelection = (isActive: { value: boolean; }) => {
  if (selectedItems.value.length > 0) {
    emit('finish', [parentItem.value, ...selectedItems.value])
  } else {
    emit('finish', [searchItem.value])
  }
  isActive.value = false
}

const tab = ref(1)

getItems()

const searchItems = ref([])
const searchItem: Ref<string | null> = ref(null)

async function searchBk(title: string | null) {
  console.log(title)
  const response = await api.fetchData(`/v1/${componentProps.mode}?search=${title}`)
  if (response.data) {
    searchItems.value = response.data.data.items
  }
}
</script>

<script setup>

</script>

<template>
  <v-dialog width="700">
    <template v-slot:activator="{ props }">
      <v-btn color="primary" v-bind="props" variant="outlined">Выбрать {{ componentProps.mode === 'bbk' ? 'ББК' : 'УДК'
        }}
      </v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card :title="componentProps.mode === 'bbk' ? 'Выбрать ББК' : 'Выбрать УДК'">
        <v-tabs v-model="tab">
          <v-tab :value="1">Структура</v-tab>
          <v-tab :value="2">Поиск</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item :value="1">
            <v-card-text class="overflow-auto">
              <v-select v-model="parentItem" :items="items" :label="componentProps.mode === 'bbk' ? 'ББК' : 'УДК'"
                return-object variant="outlined">
                <template v-slot:selection="{ item }">
                  <div>{{  item.raw.number  }} - {{ item.raw.title }}</div>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" @click="selectItem(item.raw)">{{ item.raw.number }} - {{ item.raw.title }}
                  </v-list-item>
                </template>
              </v-select>
              <v-select v-for="i in level" :key="i" v-model="selectedItems[i - 1]" :items="childItems[i - 1]"
                return-object variant="outlined">
                <template v-slot:selection="{ item }">
                  <div>{{  item.raw.number  }} - {{ item.raw.title }}</div>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" @click="selectItem(item.raw)">{{ item.raw.number }} - {{ item.raw.title }}
                  </v-list-item>
                </template>
              </v-select>
            </v-card-text>
          </v-window-item>

          <v-window-item :value="2">
            <v-card-text>
              <v-autocomplete v-model="searchItem" @update:search="searchBk" :items="searchItems"
                :label="componentProps.mode === 'bbk' ? 'Поиск ББК' : 'Поиск УДК'" return-object
                variant="outlined">
                <template v-slot:selection="{ item }">
                  <div>{{  item.raw.number  }} - {{ item.raw.title }}</div>
                </template>
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">{{ item.raw.number }} - {{ item.raw.title }}
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-card-text>
          </v-window-item>
        </v-window>


        <v-card-actions>
          <div class="d-flex w-100 justify-space-between px-4 pb-4">
            <v-btn color="primary" variant="flat" @click="finishSelection(isActive)">Выбрать</v-btn>
            <v-btn variant="tonal" @click="isActive.value = false">Отмена</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped></style>
