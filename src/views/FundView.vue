<script setup lang="ts">
import { useAPI } from '@/api';
import { watch } from 'vue';
import { ref, type Ref } from 'vue';
import FilterBlock from '@/components/FilterBlock.vue'
import bookForm from '@/assets/book-form.pdf'
import catalogCard from '@/assets/catalog-card.pdf'
import publisher from '@/assets/publisher.pdf'
import admission from '@/assets/admission.pdf'
import fund from '@/assets/fund.pdf'
import nocover from '@/assets/no-book-cover.svg'


const api = useAPI()

interface Book {
  id: number,
  price: number,
  book: { title: string, year: number, amount: number },
  book_annotation: string,
  amount: number,
  book_ISBN: string,
  book_author_main: { id: number, name: string }[],
  book_pages: number,
  book_language: string[],
  contractor: string,
  book_state: string,
  admission_at: string,
}

const loading: Ref<boolean> = ref(false);
const items: Ref<Book[] | null> = ref(null);
const page: Ref<number> = ref(1);
const length: Ref<number> = ref(0);

async function getBooks() {
  loading.value = true;
  try {
    const response = await api.fetchData<{ data: { items: Book[] }, meta: { last_page: number } }>(`https://test.api.qazaqmura.kz/v1/book/school?local=1&page=${page.value}`)

    if (response.data) {
      items.value = response.data.data.items;
      length.value = response.data.meta.last_page;
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const filterBlock = {
  bottomItems: [
    { label: 'Название книги', value: 42 },
    { label: 'Количество книг', value: 300 },
    { label: 'Сумма поступления книг', value: 300000000 }
  ]
}

function downloadPDF(title: string) {
  const link = document.createElement('a');
  if (title === 'bookForm') {
    link.href = bookForm;
  } else if (title === 'publisher') {
    link.href = publisher
  } else if (title === 'admission') {
    link.href = admission
  } else if (title === 'fund') {
    link.href = fund
  } else {
    link.href = catalogCard
  }
  link.download = 'document.pdf';
  link.click();
  document.body.removeChild(link);
}

getBooks()

watch(page, () => { getBooks() });
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">Фонд</span>
          <span class="text-subtitle-2 text-medium-emphasis">База данных по РК (библиографических записей)</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="flat" color="primary" class="mr-3">Генерация документов</v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn variant="flat" v-bind="props" color="primary" append-icon="mdi-chevron-down" class="mr-3">Скачать
              список</v-btn>
          </template>

          <v-list>
            <v-list-item value="publisher" @click="downloadPDF('publisher')">Отчет по издателям</v-list-item>
            <v-list-item value="admission" @click="downloadPDF('admission')">Список поступлений</v-list-item>
            <v-list-item value="fund" @click="downloadPDF('fund')">Список фонда</v-list-item>
          </v-list>
        </v-menu>
        <v-btn variant="tonal" prepend-icon="mdi-video-outline">Помощь</v-btn>
      </template>
    </v-app-bar>

    <v-row class="mx-2 my-3">
      <v-col>
        <FilterBlock :mdata="true" :users="false" :inventory="false" :one-line="false"
          :bottom-items="filterBlock.bottomItems">
        </FilterBlock>
      </v-col>
    </v-row>

    <v-row v-for="item in items" :key="item.id" class="mx-2 my-3">
      <v-card class="w-100">
        <v-card-text>
          <v-container fluid>
            <v-row>
              <v-col cols="2">
                <v-img fluid :src="nocover"></v-img>
              </v-col>
              <v-col cols="2">
                <div class="mb-2">
                  <span class="text-h5 font-weight-bold">{{ item.book.title }}</span>
                </div>

                <v-chip variant="outlined" color="primary" v-for="author in item.book_author_main" :key="author.id">{{
                  author.name }}</v-chip>
              </v-col>
              <v-col cols="5">
                <v-card variant="tonal" class="w-100">
                  <v-card-text>
                    <v-container fluid>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>Год издания:</strong></div>
                          <div>{{ item.book.year }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Язык:</strong></div>
                          <div>{{ item.book_language ? item.book_language.join(', ') : '' }}</div>
                        </v-col>
                        <v-col cols="4"></v-col>
                      </v-row>
                      <v-divider class="my-3"></v-divider>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>Контрагенты:</strong></div>
                          <div>{{ item.contractor }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Дата поступления:</strong></div>
                          <div>{{ item.admission_at }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Состояние:</strong></div>
                          <div>{{ item.book_state }}</div>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="4">
                          <div><strong>Количество:</strong></div>
                          <div>{{ item.amount }}</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Цена:</strong></div>
                          <div>{{ item.book.amount }} ₸</div>
                        </v-col>
                        <v-col cols="4">
                          <div><strong>Цена за все:</strong></div>
                          <div>{{ item.price }} ₸</div>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col>
                <v-btn color="primary" @click="downloadPDF('bookForm')" variant="flat" block class="mb-2">Книжный
                  формуляр</v-btn>
                <v-btn color="primary" @click="downloadPDF('catalogCard')" variant="flat" block class="mb-2">Каталожная
                  карточка</v-btn>
                <v-btn color="primary" variant="outlined" block class="mb-2">Изменить данные</v-btn>
                <v-btn color="primary" variant="outlined" block class="mb-2">Сброс инвентаризации</v-btn>
                <v-btn color="error" variant="outlined" block class="mb-2">Удалить из фонда</v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-row>

    <v-row class="mt-4">
      <v-pagination class="ml-auto mr-2" :length="length" :total-visible="4" v-model="page" size="small" variant="flat"
        active-color="primary"></v-pagination>
    </v-row>
  </v-container>
</template>
