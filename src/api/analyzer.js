import client from './client'

export const analyzerApi = {
  analyze: (videoUrl) =>
    client.post('/api/v1/analyzer/analyze', { video_url: videoUrl }),

  history: () =>
    client.get('/api/v1/analyzer/history'),
}
