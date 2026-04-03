import { create } from 'zustand'
import { authApi } from '../api/auth'
import { TOKEN_KEY } from '../api/client'

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Call once on app mount to rehydrate session from localStorage
  loadFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      // We have a stored token — mark as authenticated optimistically.
      // The PrivateRoute will call /auth/me to validate it on protected pages.
      set({ accessToken: token, isAuthenticated: true })
    }
  },

  login: async (email, password) => {
    const { data } = await authApi.login(email, password)
    localStorage.setItem(TOKEN_KEY, data.access_token)
    set({
      user: { id: data.user_id, email: data.email },
      accessToken: data.access_token,
      isAuthenticated: true,
    })
    return data
  },

  register: async (email, password, fullName) => {
    const { data } = await authApi.register(email, password, fullName)
    // If email confirmation is required, access_token will be empty string
    if (data.access_token) {
      localStorage.setItem(TOKEN_KEY, data.access_token)
      set({
        user: { id: data.user_id, email: data.email },
        accessToken: data.access_token,
        isAuthenticated: true,
      })
    }
    return data
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // best-effort — clear local state regardless
    }
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, accessToken: null, isAuthenticated: false })
  },
}))

export default useAuthStore
