import client from './client'

export const affiliateApi = {
  analyze: (videoUrl) =>
    client.post('/api/v1/affiliate-analyzer/analyze', { source: videoUrl }),
}
