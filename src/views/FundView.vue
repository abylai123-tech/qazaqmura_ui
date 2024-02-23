<script setup lang="ts"></script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Фонд</span>
          <span class="text-subtitle-2 text-medium-emphasis">Описание</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3" prepend-icon="mdi-video-outline">Помощь</v-btn>
        <v-btn variant="flat" color="primary" prepend-icon="mdi-plus">Добавить</v-btn>
      </template>
    </v-app-bar>
  </v-container>
</template>
