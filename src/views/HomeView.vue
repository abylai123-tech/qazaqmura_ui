<!-- eslint-disable vue/valid-v-slot -->
<script setup lang="ts">
import { useAuth } from '@/auth/index';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Pie, Doughnut } from 'vue-chartjs'
import StatisticsList from '@/components/home/StatisticsList.vue';
import SubscriptionTable from '@/components/home/SubscriptionTable.vue';
import { ref, type Ref } from 'vue';
import { useAPI } from '@/api';
import { computed } from 'vue';
import PublishersModal from '@/components/home/PublishersModal.vue'
import CountryModal from '@/components/home/CountryModal.vue'
import ClassModalVue from '@/components/home/ClassModal.vue';
import FundModalVue from '@/components/home/FundModal.vue';
import bookstate from '@/assets/bookstate.pdf'
import AgesModal from '@/components/home/AgesModal.vue';

const auth = useAuth();
const api = useAPI();

const doughnut = {
  labels: ['Годовой', 'Выдача', 'Возврат'],
  datasets: [
    {
      backgroundColor: ['#0095FF', '#00E096', '#884DFF'],
      data: [68, 10, 22]
    }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false
}

interface BookState {
  title: string,
  amount: string,
  books: number,
};

interface Publisher {
  publisher_id: number,
  publisher: string,
  amount: string,
  books: number,
}

interface UserAge {
  age: string,
  count: number,
  percent: string,
}

async function getBookState(): Promise<void> {
  fundLoading.value = true;
  try {
    const response = await api.fetchData<BookState[]>('https://test.api.qazaqmura.kz/v1/dashboard/book/state');
    fund.value = response.data;
    fundLoading.value = false;
  } catch (error: any) {
    console.error('Error:', error.message);
  }
};

async function getPublishers(): Promise<void> {
  publishersLoading.value = true;
  try {
    const response = await api.fetchData<Publisher[]>('https://test.api.qazaqmura.kz/v1/dashboard/publisher');
    publishers.value = response.data;
    publishersLoading.value = false;
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

const readers = [
  { classname: '1 класс', amount: 25 },
  { classname: '2 класс', amount: 25 },
  { classname: '3 класс', amount: 25 },
  { classname: '4 класс', amount: 25 },
]

const headers = [
  { key: 'classname', title: 'Классы' },
  { key: 'amount', title: 'Количество' },
]

const countries = [
  { id: 1, code: 'kz', name: 'Казахстан', progress: 74 },
  { id: 2, code: 'kz', name: 'Украина', progress: 52 },
  { id: 3, code: 'kz', name: 'Грузия', progress: 36 },
]

const fundHeaders = [
  { key: 'title', title: 'Название' },
  { key: 'amount', title: 'Наименование книг' },
  { key: 'books', title: 'Экземпляры книг' },
  { key: 'actions', title: '' },
]

const userAges: Ref<UserAge[]> = ref([]);

async function getUserAges() {
  try {
    const response = await api.fetchData<UserAge[]>('https://test.api.qazaqmura.kz/v1/dashboard/user/age');
    if (response.data) userAges.value = response.data;
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

const fund: Ref<BookState[] | null> = ref(null)

const fundLoading: Ref<boolean> = ref(false);

const publisherHeaders = [
  { key: 'publisher', title: 'Название' },
  { key: 'books', title: 'Наименование книг' },
  { key: 'amount', title: 'Экземпляры книг' },
]

const publishers: Ref<Publisher[] | null> = ref(null)

const publishersLoading: Ref<boolean> = ref(false);

ChartJS.register(ArcElement, Tooltip)

const agesChartData = computed(() => {
  return {
    labels: userAges.value.map(user => user.age),
    datasets: [{
      backgroundColor: ['#0095FF', '#00E096', 'red'],
      data: userAges.value.map(user => Number.parseFloat(user.percent))
    }]
  }
})

function downloadPDF() {
  const link = document.createElement('a');
  link.href = bookstate;
  link.download = 'document.pdf';
  link.click();
  document.body.removeChild(link);
}

getBookState()
getPublishers()
getUserAges()
</script>

<template>
  <main>
    <v-container>
      <v-row>
        <v-col>
          <div class="text-h5 font-weight-bold">Приборная доска</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-banner bg-color="light-blue" rounded>
            <template v-slot:prepend>
              <v-avatar color="white" icon="mdi-hand-wave"></v-avatar>
            </template>

            <v-banner-text>
              <div class="text-h6">Добро пожаловать, {{ auth.user.value ? auth.user.value.user_data.firstname : '' }}
              </div>
            </v-banner-text>
          </v-banner>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="3">
          <StatisticsList></StatisticsList>
        </v-col>
        <v-col cols="6">
          <v-card>
            <v-card-title>Статистика по выдачам и возвратам книг</v-card-title>
            <v-card-subtitle>Легко отслеживай статистику</v-card-subtitle>

            <v-card-text>
              <v-container fluid>
                <v-row>
                  <v-col>
                    <Doughnut :options="options" :data="doughnut"></Doughnut>
                  </v-col>
                  <v-col>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title>
                          <strong>Показатели</strong>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Годовой</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Годовой</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>
                          <div class="d-flex flex-column">
                            <strong>Выдача</strong>
                          </div>
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="3">
          <v-card>
            <v-card-title>Выдача и возврат</v-card-title>
            <v-card-subtitle>Быстрый поиск по ИИН</v-card-subtitle>

            <v-card-text>
              <v-text-field label="Напишите ИИН" variant="outlined" prepend-inner-icon="mdi-magnify"></v-text-field>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="3">
          <v-card>
            <v-card-title>Книги по странам</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="country in countries" :key="country.id">
                  <v-list-item-title>
                    {{ country.name }}

                    <v-progress-linear v-model="country.progress" color="primary">
                    </v-progress-linear>
                  </v-list-item-title>

                  <v-list-item-subtitle>

                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-card-actions>
              <CountryModal></CountryModal>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col>
          <v-card>
            <v-card-title>Читатели по возрасту</v-card-title>

            <v-card-text>
              <Pie :data="agesChartData" :options="options" />
            </v-card-text>

            <v-card-actions>
              <AgesModal></AgesModal>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card>
            <v-card-title>
              Классы по количеству читателей
            </v-card-title>

            <v-card-text>
              <v-data-table hide-footer :items="readers" :headers="headers">
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <ClassModalVue></ClassModalVue>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title>Состояние по фонду книг</v-card-title>

            <v-card-text>
              <v-data-table :loading="fundLoading" :items="fund ? fund : []" :headers="fundHeaders">
                <template v-slot:bottom></template>

                <template v-slot:[`item.actions`]="{ }">
                  <v-btn @click="downloadPDF()" variant="text" color="primary">
                    Подробнее
                    <template v-slot:append>
                      <v-icon icon="mdi-chevron-right" color="primary"></v-icon>
                    </template>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <FundModalVue></FundModalVue>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col>
          <v-card>
            <v-card-title>Издательства</v-card-title>

            <v-card-text>
              <v-data-table :loading="publishersLoading" :items="publishers ? publishers : []"
                :headers="publisherHeaders">
                <template v-slot:bottom></template>
              </v-data-table>
            </v-card-text>

            <v-card-actions>
              <PublishersModal></PublishersModal>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-card>
            <v-card-title>Выдача и возврат</v-card-title>

            <v-card-text>
              <SubscriptionTable></SubscriptionTable>
            </v-card-text>

            <v-card-actions>
              <v-btn variant="flat" color="primary">Подробнее</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>
