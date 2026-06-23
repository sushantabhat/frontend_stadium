import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing, radii, typography, glass } from '../constants/theme';
import { pickImage, takePhoto, uploadImage } from '../services/uploadService';
import { imageUri } from '../utils/imageUri';

export default function ImagePickerField({ label, value, onUpload, style }) {
  const [uploading, setUploading] = useState(false);

  const handlePick = async () => {
    Alert.alert('Add Image', 'Choose an option', [
      {
        text: 'Gallery',
        onPress: async () => {
          const uri = await pickImage();
          if (uri) doUpload(uri);
        },
      },
      {
        text: 'Camera',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) doUpload(uri);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const doUpload = async (uri) => {
    setUploading(true);
    try {
      const url = await uploadImage(uri);
      onUpload(url);
    } catch (err) {
      Alert.alert('Upload failed', err.response?.data?.message || 'Could not upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onUpload('');
  };

  const displayUri = imageUri(value);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      {displayUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: displayUri }} style={styles.preview} resizeMode="cover" />
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove} activeOpacity={0.7}>
            <Text style={styles.removeBtnText}>×</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBtn} onPress={handlePick} activeOpacity={0.7} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={glass.brandPurple} size="small" />
          ) : (
            <>
              <Text style={styles.uploadIcon}>+</Text>
              <Text style={styles.uploadText}>Tap to add image</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    color: glass.textMuted, fontSize: 10, fontWeight: '700',
    letterSpacing: 1, marginBottom: spacing.sm, textTransform: 'uppercase',
  },
  uploadBtn: {
    height: 120, borderRadius: radii.md,
    borderWidth: 1.5, borderColor: glass.border, borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  uploadIcon: { color: glass.brandPurple, fontSize: 28, fontWeight: '300' },
  uploadText: { color: glass.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  previewWrap: { position: 'relative', borderRadius: radii.md, overflow: 'hidden' },
  preview: { width: '100%', height: 140, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.04)' },
  removeBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
