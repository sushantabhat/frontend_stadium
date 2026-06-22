import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, spacing } from '../constants/theme';

export default function KhaltiPaymentModal({ visible, paymentUrl, onSuccess, onError, onClose }) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const handledRef = useRef(false);

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;

    if (!handledRef.current && url.includes('example.com/khalti/success')) {
      handledRef.current = true;
      const params = new URLSearchParams(url.split('?')[1] || '');
      const pidx = params.get('pidx');
      if (pidx) {
        onSuccess(pidx);
      }
    }

    if (!handledRef.current && (url.includes('example.com/khalti/failure') || url.includes('khalti.com/cancel'))) {
      handledRef.current = true;
      onError('Payment was cancelled or failed');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primaryLight} />
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={() => setLoading(false)}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07080B' },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  webview: { flex: 1, opacity: 0.99 },
});
