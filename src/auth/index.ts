import { ref, onMounted } from 'vue'
import axios from 'axios'

interface User {
  id: number,
  email: string,
  login: string,
  status: boolean,
  roles: [],
  user_data: {
    firstname: string,
    lastname: string,
    fathername: string,
    phone: string,
  }
}

interface Token {
  token: string,
  expiration: string,
}

const user = ref<User | null>(null);
const token = ref<Token | null>(null);

function checkExpiration() {
  const today = new Date();
  if (token.value && new Date(token.value.expiration) > today) {
    return true;
  }
  return false;
}

export function useAuth() {
  onMounted(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = JSON.parse(storedToken);
      user.value = JSON.parse(storedUser);
    }

    if (!checkExpiration()) {
      logout();
    }
  });

  async function login(form: { login: string, password: string, device: string }) {
    try {
      const response = await axios.post('https://test.api.qazaqmura.kz/v1/login', form);
      token.value = { token: response.data.token, expiration: response.data.token_expired };
      user.value = { 
        id: response.data.id, 
        email: response.data.email, 
        login: response.data.login,
        status: response.data.status,
        user_data: response.data.user_data,
        roles: response.data.roles,
      };

      localStorage.setItem('token', JSON.stringify(token.value));
      localStorage.setItem('user', JSON.stringify(user.value));

      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { user, token, login, logout };
}