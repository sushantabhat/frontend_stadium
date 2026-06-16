import api from './api';

export async function fetchMatchRecommendations() {
  const response = await api.get('/api/ai/recommendations/matches');
  return response.data.recommendations;
}

export async function fetchSmartSeatRecommendations(matchId, category, count = 2) {
  const response = await api.get(`/api/ai/matches/${matchId}/recommend-seats`, {
    params: { category, count },
  });
  return response.data.recommendations;
}

export async function fetchDynamicPricingSuggestions(matchId) {
  const response = await api.get(`/api/ai/matches/${matchId}/dynamic-pricing`);
  return response.data.suggestions;
}
