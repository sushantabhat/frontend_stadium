import api from './api';

export async function fetchVenues() {
  const response = await api.get('/api/admin/venues');
  return response.data.venues;
}

export async function createVenue({ name, location, pricing, stadiumSections, seatLayout, gates }) {
  const response = await api.post('/api/admin/venues', { name, location, pricing, stadiumSections, seatLayout, gates });
  return response.data.venue;
}

export async function updateVenue(id, { name, location, pricing, stadiumSections, seatLayout, gates }) {
  const response = await api.put(`/api/admin/venues/${id}`, { name, location, pricing, stadiumSections, seatLayout, gates });
  return response.data.venue;
}

export async function deleteVenue(id) {
  const response = await api.delete(`/api/admin/venues/${id}`);
  return response.data;
}
