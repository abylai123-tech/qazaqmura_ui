import { onMounted, type Ref, ref } from 'vue'
import { useAPI } from '@/api'
import router from '@/router';

interface User {
  id: number
  email: string
  login: string
  status: boolean
  roles: any[]
  user_data: {
    firstname: string
    lastname: string
    fathername: string
    phone: string
  }
}

interface Token {
  token: string
  expiration: string
}

interface Data {
  id: number
  status: boolean
  login: string
  email: string
  school: {
    id: number
    name: string
    region_id: number
    description: {
      bin: string
      address: string
      zip_code: string
    }
    organization: null
  }
  avatar: null
  user_data: {
    id: number
    sex: number | null
    document_ID: string
    birthday: null
    fathername: string | null
    firstname: string
    lastname: string
    phone: string
    nationality: null
  }
  roles: [
    {
      id: number
      name: string
      label: string
    }
  ]
  user_signature: {
    id: number
    value: string
  }
  classrooms:
    | [
        {
          id: number
          number: string
          letter: string
        }
      ]
    | null
  user_relation: null
}

const user = ref<User | null>(null)
const token = ref<Token | null>(null)
const userData: Ref<Data | null> = ref(null)

function checkExpiration() {
  const today = new Date()
  return !!(token.value && new Date(token.value.expiration) > today)
}

const api = useAPI()

export function useAuth() {
  onMounted(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedData = localStorage.getItem('userData')

    if (storedToken && storedUser) {
      token.value = JSON.parse(storedToken)
      user.value = JSON.parse(storedUser)
    }

    if (storedData) {
      userData.value = JSON.parse(storedData)
    }

    if (!checkExpiration()) {
      logout();
      router.push('/login'); 
    }
  })

  async function login(form: { login: string; password: string; device: string }) {
    try {
      const response = await api.postData<
        { login: string; password: string; device: string },
        User
      >('/v1/login', form);
      
      if (response.data) {
        token.value = { token: response.data.token, expiration: response.data.token_expired };
        user.value = {
          id: response.data.id,
          email: response.data.email,
          login: response.data.login,
          status: response.data.status,
          user_data: response.data.user_data,
          roles: response.data.roles
        };
      }

      localStorage.setItem('token', JSON.stringify(token.value));
      localStorage.setItem('user', JSON.stringify(user.value));

      if (!user.value.roles.some((item) => item.id === 8)) {
        const data = await api.fetchData<Data>(`/v1/user/${user.value.id}`);
        userData.value = data.data;
        localStorage.setItem('userData', JSON.stringify(userData.value));
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }
  function logout() {
    user.value = null
    token.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userData')
  }

  return { user, token, userData, login, logout }
}
