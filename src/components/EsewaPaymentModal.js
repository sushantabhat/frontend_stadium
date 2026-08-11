import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function EsewaPaymentModal({ visible, esewaData, onSuccess, onError, onClose }) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const handledRef = useRef(false);

  const formPageUrl = esewaData?.formPageUrl || null;

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    if (!url) return;

    // Reset handled flag when modal opens fresh
    if (url === formPageUrl) {
      handledRef.current = false;
    }

    if (!handledRef.current && url.includes('example.com/esewa/success')) {
      handledRef.current = true;
      const dataMatch = url.match(/[?&]data=([^&]+)/);
      const data = dataMatch ? decodeURIComponent(dataMatch[1]) : null;
      if (data) {
        onSuccess(data);
      } else {
        onError('Payment succeeded but missing transaction data');
      }
    }

    if (!handledRef.current && url.includes('example.com/esewa/failure')) {
      handledRef.current = true;
      onError('eSewa payment was cancelled or failed');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => { handledRef.current = false; setLoading(true); }}
    >
      <View style={styles.container}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#62BA46" />
          </View>
        )}
        {formPageUrl ? (
          <WebView
            ref={webViewRef}
            source={{ uri: formPageUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onLoadEnd={() => setLoading(false)}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            startInLoadingState={false}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07080B' },
  loading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
    backgroundColor: '#07080B',
  },
  webview: { flex: 1 },
});
