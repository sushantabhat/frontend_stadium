import * as ImagePickerLib from 'expo-image-picker';
import api from './api';

export async function uploadImage(uri) {
  const form = new FormData();
  const filename = uri.split('/').pop() || 'image.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  form.append('image', { uri, name: filename, type: mimeType });

  const response = await api.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data.url;
}

export async function pickImage() {
  const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePickerLib.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [16, 9],
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

export async function takePhoto() {
  const { status } = await ImagePickerLib.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePickerLib.launchCameraAsync({
    quality: 0.8,
    allowsEditing: true,
    aspect: [16, 9],
  });

  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}
