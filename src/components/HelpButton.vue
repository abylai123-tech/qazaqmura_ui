<script lang="ts" setup>
import { computed } from 'vue'

const aspectRatioHeight = computed(() => {
  return Math.floor((9 / 16) * 60) + 'vw'
})
</script>

<template>
  <v-dialog max-width="60vw">
    <template v-slot:activator="{ props }">
      <v-btn prepend-icon="mdi-video-outline" v-bind="props" variant="tonal">Помощь</v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card width="60vw">
        <v-card-title>
          <div class="d-flex justify-space-between">
            <span>Помощь</span>
            <v-btn icon="mdi-close" variant="flat" @click="isActive.value = false"></v-btn>
          </div>
        </v-card-title>

        <v-card-text>
          <iframe
            :style="{ height: aspectRatioHeight }"
            allowfullscreen
            frameborder="0"
            src="https://www.youtube.com/embed/on2Tl7OhuZg"
            width="100%"
          ></iframe>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<style scoped></style>
