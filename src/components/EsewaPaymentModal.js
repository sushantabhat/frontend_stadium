import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, spacing } from '../constants/theme';

export default function EsewaPaymentModal({ visible, formData, paymentUrl, onSuccess, onError, onClose }) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const handledRef = useRef(false);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#07080B;">
      <form id="esewaForm" method="POST" action="${paymentUrl}">
        ${Object.entries(formData).map(([key, val]) => `<input type="hidden" name="${key}" value="${val}" />`).join('')}
      </form>
      <script>document.getElementById('esewaForm').submit();</script>
    </body>
    </html>
  `;

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;

    if (!handledRef.current && url.includes('example.com/esewa/success')) {
      handledRef.current = true;
      const params = new URLSearchParams(url.split('?')[1] || '');
      const data = params.get('data');
      if (data) {
        onSuccess(data);
      }
    }

    if (!handledRef.current && (url.includes('example.com/esewa/failure') || url.includes('payment-cancelled'))) {
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
          source={{ html: htmlContent }}
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
