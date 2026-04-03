import client from './client'

export const imagesApi = {
  generate: (prompt) =>
    client.post('/api/v1/images/generate', { prompt }),

  history: () =>
    client.get('/api/v1/images/history'),

  get: (generationId) =>
    client.get(`/api/v1/images/${generationId}`),
}
