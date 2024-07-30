<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/auth/index'
import router from '@/router'
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
const user = ref({ login: '', password: '', device: 'web' })

const loading = ref(false)
const showPassword = ref(false)

const switchLocale = (newLocale: string) => {
  locale.value = newLocale
}

const signIn = async function () {
  loading.value = true
  const auth = useAuth()
  auth.login(user.value)
  try {
    await auth.login(user.value)
    loading.value = false
    router.push({ name: 'home' })
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}
</script>

<template>
  <v-container fluid class="background-container">
    <v-row>
      <v-col class="d-flex align-center justify-center flex-column">
        <div class="d-flex w-100">
          <div class="ml-auto">
          <v-btn
            @click="switchLocale('kk')"
            variant="text"
            :color="locale === 'kk' ? 'black' : 'grey'"
            >Каз</v-btn
          >
          <v-divider vertical inset></v-divider>
          <v-btn
            @click="switchLocale('ru')"
            variant="text"
            :color="locale === 'ru' ? 'black' : 'grey'"
            >Рус</v-btn
          >
        </div>
        </div>
        <v-card :loading="loading" style="margin-top: 15vh" class="text-center py-4">
          <v-card-title>{{ t('authorization') }}</v-card-title>
          <v-card-subtitle>{{ t('login_using_username_password') }}</v-card-subtitle>
          <v-card-text>
            <v-form @submit.prevent>
              <v-text-field v-model="user.login" label="Логин" variant="outlined"></v-text-field>

              <v-text-field
                v-model="user.password"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                :label="t('password')"
                counter
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
              ></v-text-field>

              <v-checkbox :label="t('i_agree_to_processing_personal_data')"></v-checkbox>
            </v-form>
          </v-card-text>

          <v-card-text>
            <v-btn variant="text" color="primary">{{ t('forgot_password') }}</v-btn>
          </v-card-text>

          <v-card-actions>
            <v-btn
              @click="signIn"
              color="primary"
              size="x-large"
              class="mx-auto px-16"
              variant="flat"
              >{{ t('login') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
.background-container {
  width: 100vw;
  height: 100vh;
  background-image: url('../assets/auth.svg');
}
</style>
