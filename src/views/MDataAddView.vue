<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useAPI } from '@/api';

const api = useAPI()

interface Form {
  author_id: number[] | null;
  author_id_main: number[] | null;
  bbk_id: number | null;
  udk_id: number | null;
  category_id: number | null;
  annotation: string;
  genre_id: number[] | null;
  ISBN: string;
  language_id: number[] | null;
  pages: number | null;
  publisher_id: number | null;
  quotes: string;
  title: string;
  type_id: number | null;
  year: number | null;
  book_classroom: number | null;
  book_classroom_language_id: number | null;
  country_id: number | null;
  amount: number | null;
  copyright_sign_id: number | null;
  content_type_id: number | null;
  age_characteristic_id: number | null;
  binding_id: number | null;
  education_level_id: number | null;
  reprint_book_id: number[] | null;
  reprint_publisher_id: number[] | null;
  titles: { language_id: number; title: string }[];
  tags: number[] | null;
  part: number | null;
  volume: number | null;
  materials: number[] | null;
  link: { URL: string; title: string };
}

interface BookAdmission {
  amount: number;
  book_id: number;
  book_state_id: number | null;
  price: number;
  admission_at: string;
  contractor_id: number | null;
  book_admission_id: number | null;
}

interface Author {
  id: number,
  name: string,
}

interface Publisher {
  id: number,
  title: string,
}

interface Material {
  id: number,
  label: string,
}

interface Contractor {
  address: string;
  company_ID: string;
  id: number;
  system: boolean;
  title: string;
}

const valid: Ref<boolean> = ref(false)
const showAdditionalData: Ref<boolean> = ref(false)
const showFundData: Ref<boolean> = ref(false)
const authors: Ref<Author[]> = ref([])
const publishers: Ref<Publisher[]> = ref([])
const cities: Ref<Publisher[]> = ref([])
const types: Ref<Publisher[]> = ref([])
const languages: Ref<Publisher[]> = ref([])
const additionalAuthors: Ref<boolean> = ref(false)
const contractors: Ref<Contractor[]> = ref([])
const states: Ref<Publisher[]> = ref([])
const admissions: Ref<Publisher[]> = ref([])
const materials: Ref<Material[]> = ref([])
const parts = [
  {
    id: 1,
    title: 'Часть',
  },
  {
    id: 1,
    title: 'Том',
  },
]
const form: Ref<Form> = ref({
  author_id: [],
  author_id_main: [],
  bbk_id: null,
  udk_id: null,
  category_id: null,
  annotation: "",
  genre_id: [],
  ISBN: "",
  language_id: [],
  pages: null,
  publisher_id: null,
  quotes: "",
  title: "",
  type_id: null,
  year: null,
  book_classroom: null,
  book_classroom_language_id: null,
  country_id: null,
  amount: null,
  copyright_sign_id: null,
  content_type_id: null,
  age_characteristic_id: null,
  binding_id: null,
  education_level_id: null,
  reprint_book_id: [],
  reprint_publisher_id: [],
  titles: [],
  tags: [],
  part: null,
  volume: null,
  materials: [],
  link: { URL: "", title: "" }
})
const admission: Ref<BookAdmission> = ref({
  amount: 0,
  book_id: 0,
  book_state_id: null,
  price: 0,
  admission_at: "",
  contractor_id: null,
  book_admission_id: null
})
const language: Ref<number> = ref(1)

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
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) publishers.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getCities(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/city`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) cities.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getTypes(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/type`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) types.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getLanguages(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/language`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) languages.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getContractors(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/contractor`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Contractor[] } }>(request)
    if (response.data) contractors.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getStates(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/book/state`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) states.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getAdmissions(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/book/admission`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Publisher[] } }>(request)
    if (response.data) admissions.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

async function getMaterials(search = null) {
  try {
    let request = `https://test.api.qazaqmura.kz/v1/material`;
    if (search) { request += `?search=${search}` }
    const response = await api.fetchData<{ data: { items: Material[] } }>(request)
    if (response.data) materials.value = response.data.data.items;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

function removeNullOrEmptyFields(obj: any): any {
  const newObj: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0) &&
      !(typeof value === 'string' && value.trim() === '')
    ) {
      newObj[key] = value;
    }
  }
  return newObj;
}


async function sendBookData() {
  const body = removeNullOrEmptyFields(form.value)
  try {
    const response = await api.postData<Form, { id: number }>('https://test.api.qazaqmura.kz/v1/book', body);
    if (response.data && showFundData.value) {
      const id = response.data.id;
      admission.value.book_id = id;
      await api.postData<{ books: BookAdmission[] }, {}>(
        'https://test.api.qazaqmura.kz/v1/book/school/link', { books: [admission.value] });
    }
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

getAuthors()
getPublishers()
getCities()
getTypes()
getLanguages()
getContractors()
getStates()
getAdmissions()
getMaterials()
</script>

<template>
  <v-container fluid>
    <v-app-bar>
      <template v-slot:title>
        <div class="d-flex flex-column">
          <span class="text-h6 font-weight-bold">M-DATA</span>
          <span class="text-subtitle-2 text-medium-emphasis">База данных по РК (библиографических записей)</span>
        </div>
      </template>

      <template v-slot:append>
        <v-btn variant="tonal" class="mr-3" prepend-icon="mdi-video-outline">Помощь</v-btn>
        <v-btn variant="flat" color="primary" to="/m-data/add" prepend-icon="mdi-plus">Добавить</v-btn>
      </template>
    </v-app-bar>

    <v-row>
      <v-col>
        <v-btn to="/m-data" variant="text" prepend-icon="mdi-arrow-left">Назад</v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-6">
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title>
            Основные данные
          </v-card-title>

          <v-card-subtitle>
            1/2
          </v-card-subtitle>

          <v-card-text>
            <v-form v-model="valid">
              <v-container fluid>
                <v-row>
                  <v-col>
                    <v-text-field v-model="form.title" label="Название" variant="outlined" placeholder="Напишите название"
                      required></v-text-field>
                  </v-col>
                </v-row>

                <v-row v-for="item in form.titles" :key="item.title">
                  <v-col>
                    <v-text-field v-model="item.title" label="Доп заголовок" variant="outlined"
                      placeholder="Напишите название"></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-btn @click="form.titles.push({ title: '', language_id: language++ })" color="primary"
                      variant="outlined" prepend-icon="mdi-plus">Другое название</v-btn>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-textarea v-model="form.annotation" label="Аннотация" variant="outlined"
                      placeholder="Напишите более 15 слов"></v-textarea>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field type="number" v-model="form.pages" label="Страницы" variant="outlined"
                      placeholder="Укажите"></v-text-field>
                  </v-col>

                  <v-col>
                    <v-text-field type="number" v-model="form.year" label="Год издания" variant="outlined"
                      placeholder="Укажите" prepend-inner-icon="mdi-magnify"></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title>
            Основные данные
          </v-card-title>

          <v-card-subtitle>
            2/2
          </v-card-subtitle>

          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-autocomplete @update:search="getAuthors" multiple v-model="form.author_id_main" :items="authors"
                    item-title="name" item-value="id" variant="outlined" label="Основной автор"
                    placeholder="Укажите автора"></v-autocomplete>
                </v-col>
              </v-row>

              <v-row v-if="additionalAuthors">
                <v-col>
                  <v-autocomplete @update:search="getAuthors" multiple v-model="form.author_id" :items="authors"
                    item-title="name" item-value="id" variant="outlined" label="Другие авторы"
                    placeholder="Укажите автора"></v-autocomplete>
                </v-col>
              </v-row>

              <v-row v-if="!additionalAuthors">
                <v-col>
                  <v-btn @click="additionalAuthors = true" variant="outlined" color="primary" prepend-icon="mdi-plus">
                    Добавить других авторов
                  </v-btn>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field variant="outlined" prepend-inner-icon="mdi-magnify" label="Квалификация"
                    placeholder="Поиск"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field variant="outlined" v-model="form.ISBN" prepend-inner-icon="mdi-magnify" label="ISBN"
                    placeholder="Укажите ISBN"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="3">
                  <strong>
                    Раздел произведения:
                  </strong>
                </v-col>
                <v-col>
                  <v-select variant="outlined" v-model="form.part" :items="parts" item-value="id" label="Произведение"
                    placeholder="Укажите произведение"></v-select>
                </v-col>
                <v-col>
                  <v-select variant="outlined" v-model="form.volume" :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]"
                    label="Цифра" placeholder="Выберите цифру"></v-select>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-btn variant="outlined" color="primary" prepend-icon="mdi-plus">
                    ISBN дополнительный
                  </v-btn>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete @update:search="getPublishers" v-model="form.publisher_id" :items="publishers"
                    item-value="id" variant="outlined" prepend-inner-icon="mdi-magnify" label="Издатель"
                    placeholder="Укажите издателя"></v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete @update:search="getCities" item-value="id" :items="cities" variant="outlined"
                    prepend-inner-icon="mdi-magnify" label="Город" placeholder="Поиск"></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field type="number" v-model="form.amount" variant="outlined" label="Тираж"
                    placeholder="Поиск"></v-text-field>
                </v-col>
                <v-col>
                  <v-autocomplete item-value="id" v-model="form.type_id" :items="types" variant="outlined" label="Тип"
                    placeholder="Поиск" prepend-inner-icon="mdi-magnify"></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete multiple item-value="id" v-model="form.language_id" :items="languages"
                    variant="outlined" label="Язык" placeholder="Поиск" prepend-inner-icon="mdi-magnify"></v-autocomplete>
                </v-col>
                <v-col>
                  <v-autocomplete multiple item-value="id" item-title="label" v-model="form.materials" chips
                    :items="materials" variant="outlined" label="Обозначение материала" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="showAdditionalData">
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title>Дополнительные данные</v-card-title>

          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-text-field variant="outlined" label="Предметная рубрика" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field variant="outlined" label="Ключевые слова" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <div class="d-flex">
                    <div class="d-flex flex-column">
                      <span class="mb-2">ББК</span>
                      <v-btn variant="outlined" color="primary">Выбрать ББК</v-btn>
                    </div>
                    <div class="d-flex flex-column ml-4">
                      <span class="mb-2">УДК</span>
                      <v-btn variant="outlined" color="primary">Выбрать УДК</v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field variant="outlined" label="Авторский знак" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field variant="outlined" label="Виды содержания" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field variant="outlined" label="Возрастная характеристика" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field variant="outlined" label="Переплет" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field variant="outlined" label="Жанры" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-switch color="primary" label="Укажите для какого класса , если это учебник"></v-switch>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field variant="outlined" label="Класс" placeholder="Укажите класс"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field variant="outlined" label="Страна" placeholder="Поиск"
                    prepend-inner-icon="mdi-magnify"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <div class="d-flex">
                    <div class="d-flex flex-column">
                      <span class="mb-2">Обложка</span>
                      <v-btn variant="outlined" color="primary">Выбрать файл</v-btn>
                    </div>
                    <div class="d-flex flex-column ml-4">
                      <span class="mb-2">EPUB</span>
                      <v-btn variant="outlined" color="primary">Выбрать файл</v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field v-model="form.link.title" variant="outlined" label="Ссылка"
                    placeholder="Название"></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field v-model="form.link.URL" variant="outlined" placeholder="URL"></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="showFundData">
      <v-col cols="8" offset="2">
        <v-card>
          <v-card-title>Данные для фонда</v-card-title>

          <v-card-text>
            <v-container fluid>
              <v-row>
                <v-col>
                  <v-autocomplete v-model="admission.book_admission_id" item-value="id" :items="admissions"
                    variant="outlined" label="Поступление" placeholder="Выберите"></v-autocomplete>
                </v-col>
                <v-col>
                  <v-text-field v-model="admission.admission_at" type="date" variant="outlined" label="Дата поступления"
                    placeholder="ДД.ММ.ГГ"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete @update:search="getContractors" v-model="admission.contractor_id" :items="contractors"
                    item-value="id" variant="outlined" label="Контрагент" placeholder="Укажите"></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-text-field v-model="admission.amount" variant="outlined" type="number" label="Количество"
                    placeholder="Выберите"></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field v-model="admission.price" type="number" step="0.01" variant="outlined" label="Цена"
                    placeholder="0,00"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-autocomplete item-value="id" :items="states" v-model="admission.book_state_id" variant="outlined"
                    label="Состояние книги" placeholder="Выберите"></v-autocomplete>
                </v-col>
              </v-row>

              <v-row>
                <v-col>
                  <v-sheet class="px-2 py-2" rounded color="#FFE4AF">
                    <span>Обложка может быть незначительно повреждена, или потерта. На страницах могут быть незначительные
                      пометки или помарки. Страницы не порваны. Книга может быть покороблена от воздействия влаги.
                      Суперобложка может быть порвана или утеряна. Переплет прочный.</span>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="text-center">
        <v-btn v-if="!showAdditionalData" prepend-icon="mdi-plus" class="mr-2" variant="flat" color="primary"
          @click="showAdditionalData = true">Добавить
          дополнительные параметры</v-btn>

        <v-btn v-if="!showFundData" prepend-icon="mdi-plus" class="mr-2" variant="flat" color="primary"
          @click="showFundData = true">Добавить
          фонд</v-btn>

        <v-btn @click="sendBookData" prepend-icon="mdi-plus" variant="flat" color="green">Добавить запись</v-btn>
      </v-col>
    </v-row>

    <v-row></v-row>
  </v-container>
</template>