import api from './api';

export async function registerUser({ name, email, password }) {
  const response = await api.post('/api/auth/register', {
    name,
    email,
    password,
  });
  return response.data;
}

export async function loginUser({ email, password }) {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await api.get('/api/auth/me');
  return response.data.user;
}
