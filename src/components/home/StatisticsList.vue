<script setup lang="ts">
import { ref, type Ref } from 'vue'

const statistics: Ref<{ subtitle: string, color: string, title: number }[] | null> = ref([
  { subtitle: 'М-DATA', color: '#0161F2', title: 2000 },
  { subtitle: 'Школьный фонд', color: '#6900C7', title: 300 },
  { subtitle: 'Наименование книг', color: '#F86300', title: 100 },
  { subtitle: 'Сумма поступления', color: '#05AC69', title: 12000000 },
  { subtitle: 'Списанных с фонда', color: '#E81600', title: 1 },
])
</script>

<template>
  <v-list lines="two" class="py-0 rounded elevated">
    <v-list-item :style="{ borderLeft: `8px solid ${item.color}` }" class="list-border"
      v-for="(item, index) in statistics" :key="index">

      <v-list-item-title class="px-4 my-2">
        <div class="d-flex flex-column items-center">
          <strong>{{ item.title }}</strong>
          <strong :style="{ color: item.color }">{{ item.subtitle }}</strong>
        </div>
      </v-list-item-title>

      <template v-slot:append>
        <v-btn color="primary" variant="flat" icon="mdi-chevron-right"></v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped>
.list-border {
  border-bottom: 2px solid #F2F4F3;
}
</style>
