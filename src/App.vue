<script setup lang="ts">
import { RouterView, useRoute, useRouter } from 'vue-router'
import logo from '@/assets/logo.svg'
import avatar from '@/assets/avatar.png'
import { ref, computed } from 'vue'
import { useAuth } from '@/auth/index';

const menu = ref(false)
const helpMenu = ref(false)
const route = useRoute()
const auth = useAuth()
const router = useRouter()

const navigation = [
  { type: 'subheader', title: 'Главная' },
  { title: 'Приборная доска', value: 1, props: { to: { name: 'home' } } },
  {
    title: 'Пользователи',
    value: 2,
    props: { appendIcon: 'mdi-chevron-right', to: { name: 'users' } }
  },
  { type: 'subheader', title: 'Библиотека' },
  { title: 'M-DATA', value: 3, props: { appendIcon: 'mdi-chevron-right', to: { name: 'm-data' } } },
  { title: 'Фонд', value: 4, props: { appendIcon: 'mdi-chevron-right', to: { name: 'fund' } } },
  {
    title: 'Поступления',
    value: 5,
    props: { appendIcon: 'mdi-chevron-right', to: { name: 'submission' } }
  },
  {
    title: 'Контрагент',
    value: 6,
    props: { appendIcon: 'mdi-chevron-right', to: { name: 'contractor' } }
  },
  { type: 'subheader', title: 'Модули' },
  {
    title: 'Абонемент',
    value: 7,
    props: { appendIcon: 'mdi-chevron-right', to: { name: 'subscription' } }
  },
  {
    title: 'Заяки на книги',
    value: 8,
    props: { appendIcon: 'mdi-chevron-right', to: { name: 'applies' } }
  }
]

const showLayout = computed(() => {
  const noLayoutPages = ['/login']
  return !noLayoutPages.includes(route.path)
})

const helpItems = [
  { title: 'Помощь', prependIcon: 'mdi-help-circle-outline', class: 'text-h6' },
  { type: 'divider' },
  { title: 'Знакомство с платформой', subtitle: '2 минутное видео', prependIcon: 'mdi-play-box' },
  { type: 'divider' },
  { title: 'MURA Гид', subtitle: 'База данных', prependIcon: 'mdi-tab-search' },
  { type: 'divider' },
  { title: 'Заявки', subtitle: 'Форма обратной связи и контакты', prependIcon: 'mdi-application-edit' },
  { type: 'divider' },
  { title: 'Обновление', subtitle: 'Список изменений', prependIcon: 'mdi-newspaper-variant-multiple' },
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
    case 'submission':
      return 5
    case 'contractor':
      return 6
    case 'subscription':
      return 7
    case 'applies':
      return 8
    default:
      return 0
  }
})

function logoutUser() {
  auth.logout();
  router.push({ name: 'login' })
} 
</script>

<template>
  <v-layout class="app-background">
    <v-app-bar v-if="showLayout" class="app-border" flat color="white">
      <v-app-bar-title>
        <v-img class="ml-6" alt="logo" :src="logo" :width="180"></v-img>
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
                        <span class="text-primary-darken-1">{{ auth.user.value ? auth.user.value.user_data.firstname : ''
                        }}</span>
                        <v-icon icon="mdi-chevron-down"></v-icon>
                      </div>

                      <div class="text-secondary text-caption">{{ auth.user.value ? auth.user.value.login : '' }}</div>
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </template>

          <v-list>
            <v-list-item @click="logoutUser" title="Выйти" prepend-icon="mdi-logout"></v-list-item>
          </v-list>
        </v-menu>

        <v-btn icon>
          <v-badge dot color="error">
            <v-icon icon="mdi-bell-outline"></v-icon>
          </v-badge>
        </v-btn>

        <v-btn icon>
          <v-icon icon="mdi-email-outline"></v-icon>
        </v-btn>

        <v-menu v-model="helpMenu" :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon>
              <v-icon icon="mdi-help-circle-outline"></v-icon>
            </v-btn>
          </template>

          <v-list item-props lines="two" :items="helpItems"></v-list>
        </v-menu>

      </template>
    </v-app-bar>

    <v-navigation-drawer v-if="showLayout" color="#F9F9F9" permanent absolute>
      <v-list :selected="[navigationActive]" nav color="primary" :items="navigation" :lines="false">
      </v-list>
      <v-btn prepend-icon="mdi-exit-to-app" variant="text" class="mt-2">Выйти</v-btn>
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
