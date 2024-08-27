<script lang="ts" setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.svg'
import avatar from '@/assets/image-ava.svg'
import { computed, reactive, ref } from 'vue'
import { useAuth } from '@/auth/index'
import qrcode from '@/assets/qrcode.pdf'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
const menu = ref(false)
const helpMenu = ref(false)
const route = useRoute()
const auth = useAuth()
const router = useRouter()


const navigation = computed(() => [
  {
    title: t('dashboard'),
    value: 1,
    props: { prependIcon: 'mdi-view-dashboard', to: { name: 'home' } }
  },
  {
    title: t('subscription'),
    value: 2,
    props: {
      appendIcon: 'mdi-chevron-right',
      prependIcon: 'mdi-card-account-details',
      to: { name: 'users' }
    }
  },
  {
    title: 'M-DATA',
    value: 3,
    props: {
      prependIcon: 'mdi-book-open-blank-variant',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'm-data' }
    }
  },
  {
    title: 'Справочник',
    value: 20,
    props: {
      prependIcon: 'mdi-library',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'quotes' }
    }
  },
  {
    title: t('fund'),
    value: 4,
    props: {
      prependIcon: 'mdi-book-multiple',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'fund' }
    }
  },
  {
    title: t('counterparty'),
    value: 5,
    props: {
      prependIcon: 'mdi-office-building',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'contractor' }
    }
  },
  {
    title: t('inventory_management'),
    value: 6,
    props: { prependIcon: 'mdi-abacus', appendIcon: 'mdi-chevron-right', to: { name: 'inventory' } }
  },
  {
    title: t('book_requests'),
    value: 7,
    props: {
      prependIcon: 'mdi-library-shelves',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'applies' }
    }
  },
  {
    title: t('book_order'),
    value: 8,
    props: {
      prependIcon: 'mdi-invoice-list',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'purchase' }
    }
  },
  {
    title: 'Конкурс',
    value: 9,
    props: {
      prependIcon: 'mdi-library',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'contest' }
    }
  }
])

const publisherNavigation = computed(() => [
  {
    title: t('dashboard'),
    value: 1,
    props: { prependIcon: 'mdi-view-dashboard', to: { name: 'home' } }
  },
  {
    title: 'M-DATA',
    value: 3,
    props: {
      prependIcon: 'mdi-book-open-blank-variant',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'm-data' }
    }
  },
  {
    title: t('counterparty'),
    value: 5,
    props: {
      prependIcon: 'mdi-office-building',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'contractor' }
    }
  }
])

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}

const classroomNavigation = computed(() => [
  {
    title: t('dashboard'),
    value: 1,
    props: { prependIcon: 'mdi-view-dashboard', to: { name: 'home' } }
  },
  {
    title: t('subscription'),
    value: 2,
    props: {
      appendIcon: 'mdi-chevron-right',
      prependIcon: 'mdi-card-account-details',
      to: { name: 'users' }
    }
  }
])

const showLayout = computed(() => {
  const noLayoutPages = ['/login', '/apply']
  return !noLayoutPages.includes(route.path)
})

const navigationDrawerItems = computed(() => {
  if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 3)) {
    return navigation.value
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 4)) {
    return classroomNavigation.value
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 7)) {
    return publisherNavigation.value
  }
  return []
})

const navigationActive = computed(() => {
  switch (route.name) {
    case 'home':
      return 1
    case 'users':
      return 2
    case 'm-data':
      return 3
    case 'fund':
      return 4
    case 'contractor':
      return 5
    case 'inventory':
      return 6
    case 'applies':
      return 7
    case 'purchase':
      return 8
    case 'entity':
      return 14
    case 'quotes':
      return 20 
    default:
      return 0
  }
})

function logoutUser() {
  auth.logout()
  router.push({ name: 'login' })
}

function downloadPDF() {
  const link = document.createElement('a')
  link.href = qrcode
  link.download = 'document.pdf'
  link.click()
  document.body.removeChild(link)
}

const goToHelp = () => {
  window.open('https://wa.me/77052509606', '_blank')
}

const goToGuide = () => {
  window.open('https://guide.qazaqmura.kz/', '_blank')
}

const guideItems = [
  {
    term: 'M-DATA',
    meaning:
      'база данных по РК (библиографических записей). База является коллективной и централизованной'
  },
  {
    term: t('fund'),
    meaning:
      'фонд организации, упорядоченная совокупность книг, других произведений печати, рукописей, видеозаписей, звукозаписей и иных материалов, формируемая библиотекой. В состав фонда, как правило, входят непериодические, периодические и продолжающиеся издания, рукописи, аудиовизуальные материалы и электронные документы'
  },
  {
    term: t('reception'),
    meaning:
      'поступление в фонд, пополнение фонда библиотеки в результате получения обязательного экземпляра, покупки, подписки, дарения, обмена или любого другого способа'
  },
  {
    term: t('counterparty'),
    meaning: 'поставщиками книг или организаций с которого была куплена книга'
  },
  {
    term: t('inventory_management'),
    meaning: 'учет, c оценкой и учетом изменений в инвентаризационных активах\n'
  },
  {
    term: 'Библиотечный абонемент',
    meaning: 'учет, c оценкой и учетом изменений в инвентаризационных активах\n'
  },
  {
    term: t('book_requests'),
    meaning:
      'форма библиотечного обслуживания, предусматривающая выдачу-возврат на-определенных-условиях для использования вне библиотеки. Так же контроль записей\n'
  },
  {
    term: t('dashboard'),
    meaning:
      'инструмент для визуализации и анализа информации о фонде. Данные, выводимые на панель индикаторов, обычно представлены в виде ключевых показателей эффективности\n'
  },
  {
    term: t('mura_guide'),
    meaning: 'интернет ресурс где расписан инструкция по системе QAZAQMURA'
  }
]
</script>

<template>
  <v-layout class="app-background">
    <v-app-bar v-if="showLayout" class="app-border" color="white" flat>
      <v-app-bar-title>
        <v-img :src="logo" :width="180" alt="logo" class="ml-6"></v-img>
      </v-app-bar-title>

      <template v-slot:append>
        <v-menu v-model="menu" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-card flat v-bind="props">
              <v-container fluid>
                <v-row>
                  <v-col cols="4">
                    <v-avatar :image="avatar"></v-avatar>
                  </v-col>
                  <v-col cols="8">
                    <div class="d-flex flex-column">
                      <div class="d-flex flex-row justify-space-between">
                        <span class="text-primary-darken-1">{{
                          auth.user.value ? auth.user.value.user_data.firstname : ''
                        }}</span>
                        <v-icon icon="mdi-chevron-down"></v-icon>
                      </div>

                      <div class="text-secondary text-caption">
                        {{ auth.user.value ? auth.user.value.login : '' }}
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </template>

          <v-list>
            <v-list-item prepend-icon="mdi-logout" title="Выйти" @click="logoutUser"></v-list-item>
          </v-list>
        </v-menu>

        <!-- <v-btn icon>
          <v-badge color="error" dot>
            <v-icon icon="mdi-bell-outline"></v-icon>
          </v-badge>
        </v-btn> -->

        <v-btn icon="mdi-qrcode" @click="downloadPDF"></v-btn>

        <v-menu v-model="helpMenu" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn icon="mdi-help-circle-outline" v-bind="props"></v-btn>
          </template>

          <v-list lines="two">
            <v-list-item
              prepend-icon="mdi-help-circle-outline"
              :title="t('help')"
              value="1"
              @click="goToHelp"
            ></v-list-item>
            <v-divider></v-divider>
            <v-dialog max-width="65vw">
              <template v-slot:activator="{ props }">
                <v-list-item
                  prepend-icon="mdi-play-box"
                  :subtitle="t('2_minute_video')"
                  :title="t('getting_to_know_the_platform')"
                  v-bind="props"
                  value="2"
                ></v-list-item>
              </template>

              <template v-slot:default>
                <v-card></v-card>
              </template>
            </v-dialog>

            <v-divider></v-divider>
            <v-list-item
              prepend-icon="mdi-tab-search"
              :subtitle="t('database')"
              :title="t('mura_guide')"
              value="3"
              @click="goToGuide"
            ></v-list-item>
            <v-divider></v-divider>
            <v-list-item
              prepend-icon="mdi-application-edit"
              :subtitle="t('feedback_form_and_contacts')"
              :title="t('requests')"
              value="4"
            ></v-list-item>
            <v-divider></v-divider>
            <v-list-item
              prepend-icon="mdi-newspaper-variant-multiple"
              :subtitle="t('change_log')"
              :title="t('update')"
              to="/update"
              value="5"
            ></v-list-item>
            <v-divider></v-divider>
            <v-dialog max-width="65vw">
              <template v-slot:activator="{ props }">
                <v-list-item
                  prepend-icon="mdi-text-box-check"
                  :title="t('glossary')"
                  v-bind="props"
                  value="6"
                ></v-list-item>
              </template>

              <template v-slot:default>
                <v-card :title="t('glossary')">
                  <v-card-text>
                    <v-data-table
                      :headers="[
                        { key: 'term', title: 'Слова' },
                        { key: 'meaning', title: 'Трактовка' }
                      ]"
                      :items="guideItems"
                    >
                      <template v-slot:bottom></template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </template>
            </v-dialog>
          </v-list>
        </v-menu>

        <v-btn @click="switchLocale('kk')" variant="text" :color="locale === 'kk' ? 'black': 'grey'">Каз</v-btn>
        <v-divider vertical inset></v-divider>
        <v-btn @click="switchLocale('ru')" variant="text" :color="locale === 'ru' ? 'black': 'grey'">Рус</v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer
      v-if="showLayout && !(auth.user.value && auth.user.value.roles.some((obj) => obj.id === 8))"
      color="#F9F9F9"
      expand-on-hover
      permanent
      rail
      width="400"
    >
      <v-list
        v-if="!(auth.user.value && auth.user.value.roles.some((obj) => obj.id === 1))"
        :items="navigationDrawerItems"
        :lines="false"
        color="primary"
        nav
      >
      </v-list>
      <v-list v-else :selected="[navigationActive]" color="primary" nav>
        <v-list-item
          :to="{ name: 'home' }"
          :value="1"
          prepend-icon="mdi-view-dashboard"
          :title="t('dashboard')"
        ></v-list-item>
        <v-list-group :value="2">
          <template v-slot:activator="{ props }">
            <v-list-item
              prepend-icon="mdi-card-account-details"
              title="Клиенты"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :value="3" title="Организации" to="/organizations"></v-list-item>
          <v-list-item :value="4" title="Тип организации" to="/organizationTypes"></v-list-item>
          <v-list-item :value="5" :title="t('requests')" to="/organizationApplies"></v-list-item>
          <v-list-item
            :value="6"
            title="Запросы на получение"
            to="/organizationRequests"
          ></v-list-item>
        </v-list-group>
        <v-list-group :value="7">
          <template v-slot:activator="{ props }">
            <v-list-item
              prepend-icon="mdi-card-account-details"
              :title="t('users')"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :value="8" title="Роли пользователей" to="/userRoles"></v-list-item>
          <v-list-item :value="9" title="Реестр пользователей" to="/users"></v-list-item>
        </v-list-group>
        <v-list-item
          :to="{ name: 'm-data' }"
          :value="10"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-library"
          title="M-DATA"
        ></v-list-item>
        <v-list-item
          :to="{ name: 'contractor' }"
          :value="11"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-bank"
          :title="t('counterparty')"
        ></v-list-item>
        <v-list-group :value="12">
          <template v-slot:activator="{ props }">
            <v-list-item
              :value="13"
              prepend-icon="mdi-book-multiple"
              title="Атрибуты и типы"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :to="{ name: 'publisher' }" :value="14" title="Издатели"></v-list-item>
          <v-list-item :to="{ name: 'language' }" :value="15" title="Языки"></v-list-item>
          <v-list-item :to="{ name: 'bookState' }" :value="16" title="Состоянии книг"></v-list-item>
          <v-list-item :to="{ name: 'bbk' }" :value="17" title="ББК"></v-list-item>
          <v-list-item :to="{ name: 'udk' }" :value="18" title="УДК"></v-list-item>
          <v-list-item :to="{ name: 'author' }" :value="19" title="Авторы"></v-list-item>
          <v-list-item :to="{ name: 'categories' }" :value="20" title="Классификация"></v-list-item>
          <v-list-item
            :to="{ name: 'bookAdmission' }"
            :value="21"
            :title="t('reception')"
          ></v-list-item>
          <v-list-item :to="{ name: 'genre' }" :value="22" title="Жанры"></v-list-item>
          <v-list-item
            :to="{ name: 'ageCharacteristic' }"
            :value="23"
            title="Возрастная характеристика"
          ></v-list-item>
          <v-list-item :to="{ name: 'binding' }" :value="24" title="Переплет"></v-list-item>
          <v-list-item
            :to="{ name: 'contentType' }"
            :value="25"
            title="Виды содержания"
          ></v-list-item>
          <v-list-item
            :to="{ name: 'copyrightSign' }"
            :value="26"
            title="Авторский знак"
          ></v-list-item>
          <v-list-item :to="{ name: 'country' }" title="Страна"></v-list-item>
          <v-list-item :to="{ name: 'educationLevel' }" title="Уровень образования"></v-list-item>
          <v-list-item :to="{ name: 'bookType' }" :title="t('type')"></v-list-item>
          <v-list-item :to="{ name: 'tag' }" title="Ключевые слова"></v-list-item>
          <v-list-item :to="{ name: 'material' }" title="Обозначение материала"></v-list-item>
        </v-list-group>
        <v-list-item
          :value="27"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-bank"
          title="Регионы"
          to="/regions"
        ></v-list-item>
        <v-list-group :value="28">
          <template v-slot:activator="{ props }">
            <v-list-item
              :value="29"
              prepend-icon="mdi-library-shelves"
              :title="t('libraries')"
              v-bind="props"
            ></v-list-item>
          </template>

          <v-list-item :value="30" :title="t('inventory_management')" to="/inventory"></v-list-item>
          <v-list-item :title="t('book_requests')" to="/applies"></v-list-item>
          <v-list-item :value="33" title="Запросы от библиотекарей"></v-list-item>
        </v-list-group>
        <v-list-item
          :value="34"
          append-icon="mdi-chevron-right"
          prepend-icon="mdi-list-box"
          title="Фронт сайта"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <RouterView></RouterView>
    </v-main>
  </v-layout>
</template>

<style>
body {
  font-family: 'Inter', sans-serif;
}

.app-border {
  border-bottom: 1px solid #ececec;
}

.app-background {
  background-color: #f2f2f2;
}
</style>
