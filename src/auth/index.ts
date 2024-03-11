import { onMounted, type Ref, ref } from 'vue'
import axios from 'axios'

interface User {
  id: number
  email: string
  login: string
  status: boolean
  roles: []
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

export function useAuth() {
  onMounted(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = JSON.parse(storedToken)
      user.value = JSON.parse(storedUser)
    }

    if (!checkExpiration()) {
      logout()
    }
  })

  async function login(form: { login: string; password: string; device: string }) {
    try {
      const response = await axios.post('https://test.api.qazaqmura.kz/v1/login', form)
      token.value = { token: response.data.token, expiration: response.data.token_expired }
      user.value = {
        id: response.data.id,
        email: response.data.email,
        login: response.data.login,
        status: response.data.status,
        user_data: response.data.user_data,
        roles: response.data.roles
      }

      const config = { headers: { Authorization: `Bearer ${token.value.token}` } }
      const data = await axios.get<Data>(
        `https://test.api.qazaqmura.kz/v1/user/${user.value.id}`,
        config
      )
      userData.value = data.data

      localStorage.setItem('token', JSON.stringify(token.value))
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('userData', JSON.stringify(userData.value))

      return true
    } catch (error) {
      console.error('Error:', error)
      return false
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
