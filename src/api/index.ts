// api.ts
import axios, { type AxiosResponse } from 'axios'
import { ref, type Ref } from 'vue'
import { useAuth } from '@/auth/index'
import { useI18n } from 'vue-i18n'
const host = import.meta.env.VITE_API_BASE_URL

interface ApiResponse<T> {
  data: T | null
  error: string | null
}
 
export function useAPI() {
  const { token } = useAuth()

  async function postData<T, U>(url: string, postData: T, blob?: boolean): Promise<ApiResponse<U>> {
    const data: Ref<U | null> = ref(null)
    const error: Ref<string | null> = ref(null)

    try {
      const config: any = {
        headers: { 'Content-Type': 'application/json'}
      };
      if (blob) {
        config.responseType = 'blob'
      }

      config.headers = token.value ? { Authorization: `Bearer ${token.value.token}` } : {}
      const response: AxiosResponse<U> = await axios.post(host + url, postData, config)
      data.value = response.data; 

      console.log('Response data', response.data);
    } catch (err: any) {
      console.error('Error Response:', err.response?.data || err.message);
      throw new Error(err.response.data.message)
    }

    return { data: data.value, error: error.value }
  }

  async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
    // const t = useI18n()

    const data: Ref<T | null> = ref(null)
    const error: Ref<string | null> = ref(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<T> = await axios.get(host + url, config)
      data.value = response.data
    } catch (err) {
      throw new Error(err.response.data)
    }

    return { data: data.value, error: error.value }
  }

  async function fetchFile(url: string, body = {}) {
    try {
      const response = await axios({
        url: host + url,
        method: 'POST',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token.value?.token}` },
        data: body
      });

      return response;
    } catch (error) {
      console.error('Error downloading the PDF:', error);
    }
  }

  async function deleteData<U>(url: string): Promise<ApiResponse<U>> {
    const data: Ref<U | null> = ref(null)
    const error: Ref<string | null> = ref(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<U> = await axios.delete(host + url, config)
      data.value = response.data
    } catch (err) {
      error.value = 'Error posting data'
      console.error('Error posting data:', err)
    }

    return { data: data.value, error: error.value }
  }

  async function patchData<T, U>(url: string, patchData: T): Promise<ApiResponse<U>> {
    const data = ref<U | null>(null)
    const error = ref<string | null>(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<U> = await axios.patch(host + url, patchData, config)
      data.value = response.data
    } catch (err) {
      throw new Error(err)
    }

    return { data: data.value, error: error.value }
  }

  async function putData<T, U>(url: string, putData: T): Promise<ApiResponse<U>> {
    const data = ref<U | null>(null)
    const error = ref<string | null>(null)

    try {
      const config = token.value
        ? { headers: { Authorization: `Bearer ${token.value.token}`, 'Accept-Language': 'ru' } }
        : { 'Accept-Language': 'ru' }
      const response: AxiosResponse<U> = await axios.put(host + url, putData, config)
      data.value = response.data
    } catch (err) {
      throw new Error(err)
    }

    return { data: data.value, error: error.value }
  }

  return {
    fetchData,
    postData,
    deleteData,
    patchData,
    putData,
    fetchFile
  }
}
