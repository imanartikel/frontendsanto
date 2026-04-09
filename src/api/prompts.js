import client from './client'

export const promptsApi = {
  generateImagePrompt: (payload) =>
    client.post('/api/v1/prompts/generate-image', payload),

  generateVideoPrompt: (payload) =>
    client.post('/api/v1/prompts/generate-video', payload),

  generateShopeeSequence: (payload) =>
    client.post('/api/v1/prompts/generate-shopee-sequence', payload),
}
