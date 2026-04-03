import client from './client'

export const tokensApi = {
  balance: () =>
    client.get('/api/v1/tokens/balance'),

  transactions: () =>
    client.get('/api/v1/tokens/transactions'),

  topup: (packageName) =>
    client.post('/api/v1/tokens/topup', { package: packageName }),

  pricing: () =>
    client.get('/api/v1/tokens/pricing'),
}
