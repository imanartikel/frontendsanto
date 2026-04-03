import client from './client'

export const videosApi = {
  generate: (prompt, model) =>
    client.post('/api/v1/videos/generate', { prompt, model }),

  status: (jobId) =>
    client.get(`/api/v1/videos/status/${jobId}`),

  history: () =>
    client.get('/api/v1/videos/history'),
}
