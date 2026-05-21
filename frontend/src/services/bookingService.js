import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  validateQR: (qrCode) => api.post('/bookings/validate-qr', qrCode, {
    headers: { 'Content-Type': 'text/plain' }
  }),
  exitParking: (id) => api.post(`/bookings/${id}/exit`),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),

  // Admin
  getAllBookings: () => api.get('/admin/bookings'),
};
