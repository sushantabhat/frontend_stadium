import api from './api';

export async function fetchMatches(includeAll = false) {
  const response = await api.get('/api/matches', {
    params: includeAll ? { all: 'true' } : undefined,
  });
  return response.data.matches;
}

export async function fetchMatchById(matchId) {
  const response = await api.get(`/api/matches/${matchId}`);
  return response.data.match;
}

export async function fetchMatchSeats(matchId, { category, sectionId } = {}) {
  const params = {};
  if (category) params.category = category;
  if (sectionId) params.sectionId = sectionId;

  const response = await api.get(`/api/matches/${matchId}/seats`, {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return response.data.seats;
}

export async function createMatch(payload) {
  const response = await api.post('/api/matches', payload);
  return response.data.match;
}

export async function updateMatch(matchId, payload) {
  const response = await api.patch(`/api/matches/${matchId}`, payload);
  return response.data.match;
}

export async function cancelMatch(matchId) {
  const response = await api.delete(`/api/matches/${matchId}`);
  return response.data.match;
}
