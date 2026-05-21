import api from './api';

export const parkingService = {
  getAllSlots: () => api.get('/slots'),
  getAvailableSlots: () => api.get('/slots/available'),
  getSlotById: (id) => api.get(`/slots/${id}`),

  // Admin
  createSlot: (data) => api.post('/admin/slots', data),
  updateSlot: (id, data) => api.put(`/admin/slots/${id}`, data),
  deleteSlot: (id) => api.delete(`/admin/slots/${id}`),
  updateSlotStatus: (id, status) =>
    api.patch(`/admin/slots/${id}/status?status=${status}`),
};
