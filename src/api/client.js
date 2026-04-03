import axios from 'axios'

const TOKEN_KEY = 'ugcx_token'

const client = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer token from localStorage to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401: clear session and redirect to /login
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      // Use replace so the user can't back-navigate to the protected page
      window.location.replace('/login')
    }
    return Promise.reject(error)
  },
)

export { TOKEN_KEY }
export default client
