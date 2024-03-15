<script lang="ts" setup>
import { RouterView, useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.svg'
import avatar from '@/assets/avatar.png'
import { computed, ref } from 'vue'
import { useAuth } from '@/auth/index'
import qrcode from '@/assets/qrcode.pdf'

const menu = ref(false)
const helpMenu = ref(false)
const route = useRoute()
const auth = useAuth()
const router = useRouter()

const navigation = [
  {
    title: 'Приборная доска',
    value: 1,
    props: { prependIcon: 'mdi-table-of-contents', to: { name: 'home' } }
  },
  {
    title: 'Абонемент',
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
    title: 'Фонд',
    value: 4,
    props: {
      prependIcon: 'mdi-book-multiple',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'fund' }
    }
  },
  {
    title: 'Контрагент',
    value: 5,
    props: {
      prependIcon: 'mdi-office-building',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'contractor' }
    }
  },
  {
    title: 'Инвентарный учет',
    value: 6,
    props: { prependIcon: 'mdi-abacus', appendIcon: 'mdi-chevron-right', to: { name: 'inventory' } }
  },
  {
    title: 'Заяки на книги',
    value: 7,
    props: {
      prependIcon: 'mdi-library-shelves',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'applies' }
    }
  },
  {
    title: 'Заказ книг',
    value: 8,
    props: {
      prependIcon: 'mdi-invoice-list',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'purchase' }
    }
  }
]

const publisherNavigation = [
  {
    title: 'Приборная доска',
    value: 1,
    props: { prependIcon: 'mdi-table-of-contents', to: { name: 'home' } }
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
    title: 'Контрагент',
    value: 5,
    props: {
      prependIcon: 'mdi-office-building',
      appendIcon: 'mdi-chevron-right',
      to: { name: 'contractor' }
    }
  }
]
const classroomNavigation = [
  {
    title: 'Приборная доска',
    value: 1,
    props: { prependIcon: 'mdi-table-of-contents', to: { name: 'home' } }
  },
  {
    title: 'Абонемент',
    value: 2,
    props: {
      appendIcon: 'mdi-chevron-right',
      prependIcon: 'mdi-card-account-details',
      to: { name: 'users' }
    }
  }
]

const showLayout = computed(() => {
  const noLayoutPages = ['/login']
  return !noLayoutPages.includes(route.path)
})

const navigationDrawerItems = computed(() => {
  if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 3)) {
    return navigation
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 4)) {
    return classroomNavigation
  } else if (auth.user.value && auth.user.value.roles.some((obj) => obj.id === 7)) {
    return publisherNavigation
  }
  return []
})

const helpItems = [
  { title: 'Помощь', prependIcon: 'mdi-help-circle-outline', class: 'text-h6' },
  { type: 'divider' },
  { title: 'Знакомство с платформой', subtitle: '2 минутное видео', prependIcon: 'mdi-play-box' },
  { type: 'divider' },
  { title: 'MURA Гид', subtitle: 'База данных', prependIcon: 'mdi-tab-search' },
  { type: 'divider' },
  {
    title: 'Заявки',
    subtitle: 'Форма обратной связи и контакты',
    prependIcon: 'mdi-application-edit'
  },
  { type: 'divider' },
  {
    title: 'Обновление',
    subtitle: 'Список изменений',
    prependIcon: 'mdi-newspaper-variant-multiple'
  },
  { type: 'divider' },
  { title: 'Глоссарий', prependIcon: 'mdi-text-box-check' }
]

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

        <v-btn icon>
          <v-badge color="error" dot>
            <v-icon icon="mdi-bell-outline"></v-icon>
          </v-badge>
        </v-btn>

        <v-btn icon>
          <v-icon icon="mdi-qrcode" @click="downloadPDF"></v-icon>
        </v-btn>

        <v-menu v-model="helpMenu" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-icon icon="mdi-help-circle-outline"></v-icon>
            </v-btn>
          </template>

          <v-list :items="helpItems" item-props lines="two"></v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-if="showLayout" color="#F9F9F9" permanent>
      <v-list
        :items="navigationDrawerItems"
        :lines="false"
        :selected="[navigationActive]"
        color="primary"
        nav
      >
      </v-list>
      <v-btn class="mt-2" prepend-icon="mdi-exit-to-app" variant="text">Выйти</v-btn>
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
