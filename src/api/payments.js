import client from './client'

export const paymentsApi = {
  createCheckout: (packageName) =>
    client.post('/api/v1/payments/create', { package: packageName }),

  getStatus: (paymentId) =>
    client.get(`/api/v1/payments/${paymentId}`),
}
