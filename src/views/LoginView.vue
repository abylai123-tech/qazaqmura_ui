<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/auth/index';
import router from '@/router';

const user = ref({ login: '', password: '', device: 'web' })

const loading = ref(false)
const showPassword = ref(false)

const signIn = async function () {
  loading.value = true;
  const auth = useAuth();
  auth.login(user.value);
  try {
    await auth.login(user.value);
    loading.value = false;
    router.push({ name: 'home' });
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}
</script>

<template>
  <v-container fluid class="background-container d-flex align-center justify-center">
    <v-card :loading="loading" class="text-center py-4">
      <v-card-title>Авторизация</v-card-title>
      <v-card-subtitle>Войдите используя логин и пароль</v-card-subtitle>
      <v-card-text>
        <v-form @submit.prevent>
          <v-text-field v-model="user.login" label="Логин" variant="outlined"></v-text-field>

          <v-text-field v-model="user.password" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'" label="Пароль" counter
            @click:append-inner="showPassword = !showPassword" variant="outlined"></v-text-field>

          <v-checkbox label="Я согласен на обработку персональных данных"></v-checkbox>
        </v-form>
      </v-card-text>

      <v-card-text>
        <v-btn variant="text" color="primary">Забыли пароль?</v-btn>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="signIn" color="primary" size="x-large" class="mx-auto px-16" variant="flat">Войти</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<style>
.background-container {
  width: 100vw;
  height: 100vh;
  background-image: url('../assets/auth.svg');
}
</style>