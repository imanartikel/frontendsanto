import client from './client'

export const authApi = {
  register: (email, password, fullName) =>
    client.post('/api/v1/auth/register', {
      email,
      password,
      full_name: fullName || null,
    }),

  login: (email, password) =>
    client.post('/api/v1/auth/login', { email, password }),

  logout: () =>
    client.post('/api/v1/auth/logout'),

  me: () =>
    client.get('/api/v1/auth/me'),

  generations: () =>
    client.get('/api/v1/auth/generations'),
}
