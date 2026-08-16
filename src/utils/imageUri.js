import { API_BASE_URL } from '../constants/config';

export function imageUri(src) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
  return `${API_BASE_URL}${src}`;
}
