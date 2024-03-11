// api.ts
import axios, { type AxiosResponse } from 'axios';
import { ref, type Ref } from 'vue';
import { useAuth } from '@/auth/index';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export function useAPI() {
  const { token } = useAuth();

  async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
    const data: Ref<T | null> = ref(null);
    const error: Ref<string | null> = ref(null);

    try {
      const config = token.value ? { headers: { Authorization: `Bearer ${token.value.token}` } } : {};
      const response: AxiosResponse<T> = await axios.get(url, config);
      data.value = response.data;
    } catch (err) {
      error.value = 'Error fetching data';
      console.error('Error fetching data:', err);
    }

    return { data: data.value, error: error.value };
  }

  async function postData<T, U>(
    url: string,
    postData: T
  ): Promise<ApiResponse<U>> {
    const data: Ref<U | null> = ref(null);
    const error: Ref<string | null> = ref(null);

    try {
      const config = token.value ? { headers: { Authorization: `Bearer ${token.value.token}` } } : {};
      const response: AxiosResponse<U> = await axios.post(url, postData, config);
      data.value = response.data;
    } catch (err) {
      error.value = 'Error posting data';
      console.error('Error posting data:', err);
    }

    return { data: data.value, error: error.value };
  }

  async function deleteData<U>(
    url: string
  ): Promise<ApiResponse<U>> {
    const data: Ref<U | null> = ref(null);
    const error: Ref<string | null> = ref(null);

    try {
      const config = token.value ? { headers: { Authorization: `Bearer ${token.value.token}` } } : {};
      const response: AxiosResponse<U> = await axios.delete(url, config);
      data.value = response.data;
    } catch (err) {
      error.value = 'Error posting data';
      console.error('Error posting data:', err);
    }

    return { data: data.value, error: error.value };
  }

  return {
    fetchData,
    postData,
    deleteData
  };
}
