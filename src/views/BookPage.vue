<template>
  <book-reader :src="getSource()"></book-reader>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAPI } from '@/api'
import { ref } from 'vue'
import BookReader from '@/components/BookReader.vue'

const route = useRoute()
const api = useAPI()
const book = ref(null)
const getBook = async () => {
  const response = await api.fetchData(`/v1/book/${route.params.id}`)
  book.value = response.data
}
const getSource = () => {
  return `${import.meta.env.VITE_APP_API}/storage/epub/${book.value.book_epub.value}`
}

getBook()
</script>
