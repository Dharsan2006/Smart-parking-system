import api from './api';

export const paymentService = {
  processPayment: (bookingId, paymentMethod) =>
    api.post('/payments', { bookingId, paymentMethod }),
  getPaymentByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
};
