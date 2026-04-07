import client from './client'

export const podcastApi = {
  generate: (payload) =>
    client.post('/api/v1/podcast-affiliate/generate', payload),
}
