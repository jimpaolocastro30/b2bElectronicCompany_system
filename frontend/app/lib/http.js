import axios from 'axios'

export const http = axios.create({
  baseURL: '',
  withCredentials: true,
})

let refreshing = null

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const status = error?.response?.status
    const original = error?.config
    if (status !== 401 || !original || original.__isRetry) throw error

    if (!refreshing) {
      refreshing = http
        .post('/auth/refresh')
        .then(() => true)
        .catch(() => false)
        .finally(() => {
          refreshing = null
        })
    }

    const ok = await refreshing
    if (!ok) throw error

    original.__isRetry = true
    return http(original)
  },
)
