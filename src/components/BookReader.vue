<script setup>
import ePub from 'epubjs'
import { ref, watch, defineProps } from 'vue'

const progress = ref(0)
const props = defineProps({
  src: String
})
const total = ref(0)
const book = ref(null)
const rendition = ref(null)
const page = ref(1)
const tableOfContents = ref([])
const title = ref('')
const loadBook = async () => {
  book.value = ePub(props.src)
  rendition.value = book.value.renderTo('reader', {
    width: '90vw',
    height: '87vh',
    allowScriptedContent: true
  })
  await rendition.value.display()

  title.value = rendition.value

  var keyListener = function (e) {
    if ((e.keyCode || e.which) == 37) {
      rendition.value.prev()
    }

    if ((e.keyCode || e.which) == 39) {
      rendition.value.next()
    }
  }

  document.addEventListener('keyup', keyListener)

  rendition.value.on('relocated', function (location) {
    progress.value = location.start.displayed.page
    total.value = location.start.displayed.total
  })

  book.value.loaded.navigation.then((item) => {
    tableOfContents.value = item.toc
  })
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

const goToPage = (href, isActive) => {
  rendition.value.display(href)
  isActive.value = false
}

loadBook()

watch(page, async (value, oldValue) => {
  if (value > oldValue) {
    rendition.value.next()
  } else {
    rendition.value.prev()
  }
})
</script>

<template>
  <v-container class="bg-white" fluid>
    <v-system-bar dense window>
      <v-spacer></v-spacer>
      <v-dialog width="700">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            size="x-small"
            icon="mdi-format-list-bulleted"
            variant="text"
            class="mr-3"
          ></v-btn>
        </template>

        <template v-slot:default="{ isActive }">
          <v-card>
            <v-list color="primary">
              <v-list-item><strong>Оглавление</strong></v-list-item>
              <v-divider></v-divider>
              <v-list-item
                v-for="item in tableOfContents"
                :key="item.id"
                @click="goToPage(item.href, isActive)"
                >{{ item.label }}</v-list-item
              >
            </v-list>
          </v-card>
        </template>
      </v-dialog>
      <v-btn @click="toggleFullscreen" size="x-small" icon="mdi-fullscreen" variant="text"></v-btn>
    </v-system-bar>
    <v-row>
      <v-col cols="12" class="text-center">
        <strong>{{ title }}</strong>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex">
        <div
          @click="page--"
          class="navigation-btn h-100 cursor-pointer d-flex flex-column align-center"
        >
          <v-icon class="my-auto" color="grey" icon="mdi-chevron-left" size="x-large"></v-icon>
        </div>
        <div id="reader"></div>
        <div
          @click="page++"
          class="navigation-btn h-100 cursor-pointer d-flex flex-column align-center"
        >
          <v-icon class="my-auto" color="grey" icon="mdi-chevron-right" size="x-large"></v-icon>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="10" offset="1">
        <v-progress-linear v-model="progress" :max="total" color="primary" :height="25">
          <strong>{{ progress }} / {{ total }}</strong>
        </v-progress-linear>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.navigation-btn {
  width: 5vw;
}

.navigation-btn:hover {
  opacity: 0.5;
}
</style>
