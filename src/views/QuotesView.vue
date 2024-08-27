<template>
  <v-container class="h-100">
    <v-app-bar>
      <v-app-bar-title>Справочник</v-app-bar-title>
    </v-app-bar>

    <v-row v-for="book in books" :key="book.id" class="border rounded-lg bg-white my-3 py-3">
      <v-col cols="2">
        <v-img height="25vh" :src="getImageURL(book.book_cover)" class="rounded" responsive></v-img>
      </v-col>
      <v-col cols="10">
        <v-row>
          <v-col cols="10">
            <v-chip v-if="book.book_type[0]" color="primary" variant="flat">{{ book.book_type[0].title }}</v-chip>
          </v-col>
          <v-col cols="2">
            <v-chip color="green" variant="flat">Цитаты: {{ book.book_quote.length }}</v-chip>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="8">
            <div class="text-h6 font-weight-bold">{{ book.title }}</div>
            <div>{{ book.annotation }}</div>
            <div class="mt-3">
              <v-chip v-for="author in book.book_author_main" :key="author.id" color="primary" variant="outlined">{{
                author.name }}</v-chip>
            </div>
          </v-col>
          <v-col cols="4">
            <div class="rounded-lg bg-grey-lighten-2 w-100">
              <div class="d-flex flex-column mx-3">
                <div class="d-flex flex-row my-2">
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">Издатель:</div>
                    <div>{{ book.book_publisher[0] ? book.book_publisher[0].title : '' }}</div>
                  </div>
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">Год издания:</div>
                    <div>{{ book.year }}</div>
                  </div>
                </div>
                <div class="d-flex flex-row my-2">
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">Страниц:</div>
                    <div>{{ book.pages }}</div>
                  </div>
                  <div class="d-flex flex-column w-50">
                    <div class="font-weight-bold">Язык:</div>
                    <div>{{ book.book_language[0] ? book.book_language[0].title : '' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="text-right">
            <v-btn class="mr-3" variant="flat" color="primary" @click="showQuotes(book.book_quote)">Все цитаты</v-btn>
            <v-btn class="mr-3" variant="flat" color="green" @click="addQuote(book.id)">Добавить цитату</v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-pagination color="primary" :total-visible="7" v-model="page" :length="length"></v-pagination>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog max-width="60vw" v-model="showDialog">
    <v-card>
      <v-card-title>О книге и цитаты</v-card-title>
      <v-card-text>
        <div class="my-3" v-for="quote in selectedQuotes" :key="quote.id">
          <v-card variant="outlined">
            <v-card-title>{{ quote.name }}</v-card-title>
            <v-card-text>
              {{ quote.content }}
            </v-card-text>
            <v-card-text>
              <v-chip class="rounded-sm" prepend-icon="mdi-magnify">Страница: {{ quote.page }}</v-chip>
            </v-card-text>
            <v-card-actions class="bg-grey-lighten-3">
              Заметка: {{ quote.note }}
            </v-card-actions>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-dialog max-width="60vw" v-model="showAdd">
    <v-card>
      <v-card-title>Добавить цитату</v-card-title>
      <v-card-text>
        <v-container fluid>
          <v-row>
            <v-col cols="12">
              <v-text-field v-model="newQuote.name" variant="outlined" hide-details label="ФИО"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-textarea v-model="newQuote.content" variant="outlined" hide-details
                label="Цитата или информация"></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field v-model="newQuote.page" variant="outlined" hide-details label="Страница"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="newQuote.note" variant="outlined" hide-details label="Заметка"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="tonal" class="ml-auto mr-2" @click="showAdd = !showAdd">Закрыть</v-btn>
        <v-btn variant="flat" color="primary" @click="createQuote()">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { useAPI } from '@/api'

export default {
  name: 'QuotesView',
  data: () => {
    return {
      page: 1,
      length: null,
      books: [],
      showDialog: false,
      showAdd: false,
      selectedQuotes: [],
      newQuote: {
        book_id: null,
        name: '',
        content: '',
        page: '',
        note: ''
      }
    }
  },
  setup() {
    const api = useAPI()
    return { api }
  },
  methods: {
    async fetchBooks() {
      try {
        const response = await this.api.fetchData(`/v1/book?page=${this.page}&quote=1`)
        const { data, meta } = response.data

        this.books = data.items
        if (!this.length) this.length = meta.last_page
      } catch (e) {
        console.error('Error:', e.message)
      }
    },

    getImageURL(url) {
      if (url)
        return import.meta.env.VITE_APP_API + '/storage/covers/' + url.value
      else
        return '/src/assets/no-book-cover.svg'
    },
    showQuotes(quotes) {
      this.selectedQuotes = quotes;
      this.showDialog = true;
    },
    addQuote(book_id) {
      this.newQuote.book_id = book_id;
      this.showAdd = true;
    },
    async createQuote() {
      try {
        await this.api.postData('/v1/quotes', this.newQuote);
        this.showAdd = false;
        this.newQuote = {
          name: '',
          content: '',
          page: '',
          note: '',
        }
        this.fetchBooks()
      } catch (e) {
        console.error(e.message)
      }
    }
  },
  watch: {
    page() {
      this.fetchBooks()
    }
  },
  mounted() {
    this.fetchBooks()
  }
}
</script>
