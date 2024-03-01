<script setup lang="ts">
import { ref, type Ref } from 'vue';

interface Class {
  name: string,
  mark: number,
  amount: number,
}

const classesHeaders = [
  { key: 'name', title: 'Класс' },
  { key: 'mark', title: 'Маркировка' },
  { key: 'amount', title: 'Количество' }
]

const classes: Ref<Class[]> = ref([
  { name: '1 класс', mark: 5, amount: 100 },
  { name: '2 класс', mark: 5, amount: 150 },
  { name: '3 класс', mark: 5, amount: 100 },
  { name: '4 класс', mark: 5, amount: 150 },
  { name: '5 класс', mark: 5, amount: 100 },
  { name: '6 класс', mark: 5, amount: 150 },
  { name: '7 класс', mark: 5, amount: 100 },
  { name: '8 класс', mark: 5, amount: 150 },
  { name: '9 класс', mark: 5, amount: 100 },
  { name: '10 класс', mark: 5, amount: 150 },
  { name: '11 класс', mark: 5, amount: 100 },
  { name: '12 класс', mark: 5, amount: 150 },
])
</script>

<template>
  <v-dialog max-width="640">
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps" variant="flat" color="primary">Подробнее</v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-title>
          <div class="d-flex justify-space-between">
            <strong class="my-auto">Классы по количеству читателей</strong>
            <v-btn variant="text" icon="mdi-close" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <v-data-table :headers="classesHeaders" :items="classes">
            <template v-slot:bottom></template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>