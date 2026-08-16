import React from 'react';
import { View } from 'react-native';
import { colors } from '../constants/theme';

export default function RefreshBar({ refreshing }) {
  if (!refreshing) return null;
  return <View style={{ height: 3, backgroundColor: colors.primary }} />;
}
