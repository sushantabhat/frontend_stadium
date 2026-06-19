import React, { useCallback, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import ScreenHeader from '../../components/ScreenHeader';
import { formatTimeInNepal } from '../../utils/date';
import { colors, spacing, radii, typography, shadows } from '../../constants/theme';
import { fetchScanHistory, verifyTicketCode } from '../../services/ticketService';

const isSecureContext = Platform.OS !== 'web'
  || typeof window === 'undefined'
  || window.location?.protocol === 'https:'
  || window.location?.hostname === 'localhost';

export default function GateScannerScreen({ navigation }) {
  const [ticketCode, setTicketCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const scanningRef = useRef(false);

  const [permission, requestPermission] = useCameraPermissions();

  const loadHistory = useCallback(async () => {
    try {
      const historyData = await fetchScanHistory();
      setScanHistory(historyData);
    } catch {
      // Quietly ignore
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Only reset scan state if camera is NOT active.
      // If camera is active, keep it locked to prevent re-scanning.
      if (!scannerActive) {
        setScanned(false);
        scanningRef.current = false;
      }
      loadHistory();
    }, [loadHistory, scannerActive])
  );

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || ticketCode;
    if (!code || !code.trim()) {
      Alert.alert('Input Required', 'Please enter or scan a ticket code.');
      scanningRef.current = false;
      return;
    }

    const trimmedCode = code.trim();
    console.log(`[GateScanner] VERIFY START code="${trimmedCode}"`);

    // CRITICAL: Close camera and freeze scan state BEFORE making the API call.
    // This prevents the camera from re-scanning the same ticket while
    // the backend request is in flight.
    setScannerActive(false);
    setIsVerifying(true);
    try {
      const response = await verifyTicketCode(trimmedCode);
      console.log(`[GateScanner] VERIFY SUCCESS code="${trimmedCode}" user=${response.ticket?.userName}`);

      // Refresh scan history from server (single source of truth)
      await loadHistory();

      navigation.navigate('TicketVerify', {
        status: 'success',
        message: response.message,
        ticket: response.ticket,
      });
      setTicketCode('');
    } catch (error) {
      if (!error.response) {
        console.log(`[GateScanner] VERIFY NETWORK_ERROR code="${trimmedCode}" error=${error.message}`);
        navigation.navigate('TicketVerify', {
          status: 'network_error',
          message: 'Cannot reach the server. Please check your network connection and try again.',
          ticketCode: trimmedCode,
        });
      } else {
        const statusCode = error.response.status;
        const errMsg = error.response.data?.message || 'Verification failed';
        console.log(`[GateScanner] VERIFY FAILED code="${trimmedCode}" status=${statusCode} msg="${errMsg}"`);

        let screenStatus = 'invalid';
        if (statusCode === 409) {
          screenStatus = 'duplicate';
        }

        navigation.navigate('TicketVerify', {
          status: screenStatus,
          message: errMsg,
          ticketCode: trimmedCode,
        });
      }
    } finally {
      setIsVerifying(false);
      setScanned(false);
      scanningRef.current = false;
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    // Triple guard: ref lock + scanned state + verifying state
    // Prevents any possibility of duplicate API calls
    if (scanningRef.current || isVerifying) return;
    scanningRef.current = true;
    setScanned(true);
    console.log(`[GateScanner] QR SCANNED data="${data}"`);
    handleVerify(data);
  };

  const toggleScanner = async () => {
    if (scannerActive) {
      setScannerActive(false);
      setScanned(false);
      setCameraError(null);
      return;
    }

    if (!isSecureContext) {
      setCameraError('Camera requires HTTPS. Use manual entry below.');
      return;
    }

    if (!permission) {
      return;
    }

    if (permission.granted) {
      setScannerActive(true);
      setScanned(false);
      setCameraError(null);
      return;
    }

    const result = await requestPermission();
    if (result.granted) {
      setScannerActive(true);
      setScanned(false);
      setCameraError(null);
    } else {
      setCameraError('Camera access denied. Please enable camera in your device settings.');
    }
  };

  const renderCamera = () => {
    if (!permission) {
      return (
        <View style={styles.permissionLoading}>
          <ActivityIndicator size="large" color={colors.primaryLight} />
          <Text style={styles.permissionText}>Requesting camera access...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionDenied}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDesc}>
            Grant camera permission to scan QR tickets at the gate.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission} activeOpacity={0.8}>
            <Text style={styles.permissionBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.scanLabel}>
            {scanned ? 'Processing...' : 'Point camera at QR code'}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeCameraBtn} onPress={toggleScanner} activeOpacity={0.8}>
          <Text style={styles.closeCameraText}>✕ Close</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader title="Gate Scanner" subtitle="Stadium entry control panel" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {scannerActive ? (
          renderCamera()
        ) : (
          <View style={styles.scannerWrapper}>
            {cameraError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{cameraError}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.cameraPrompt} onPress={toggleScanner} activeOpacity={0.8}>
              <View style={styles.cameraPromptInner}>
                <Text style={styles.cameraPromptEmoji}>📷</Text>
                <Text style={styles.cameraPromptTitle}>Open Camera</Text>
                <Text style={styles.cameraPromptDesc}>Scan a fan&apos;s QR ticket code</Text>
              </View>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.manualEntryCard}>
          <Text style={styles.cardHeader}>MANUAL ENTRY</Text>
          <Text style={styles.cardDesc}>
            Type or paste a ticket code below as a fallback.
          </Text>

          <TextInput
            style={styles.inputField}
            placeholder="e.g. TKT-95476f-A-1-YZ3R0N"
            placeholderTextColor={colors.textMuted}
            value={ticketCode}
            onChangeText={setTicketCode}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]}
            onPress={() => handleVerify()}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyBtnText}>Validate Ticket Code</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.cardHeader}>RECENT SCANS</Text>

          {isLoadingHistory ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.lg }} />
          ) : scanHistory.length === 0 ? (
            <Text style={styles.emptyHistory}>No scan records in this shift.</Text>
          ) : (
            <View style={styles.historyList}>
              {scanHistory.map((item) => (
                <View key={item._id} style={styles.historyRow}>
                  <View style={styles.historyLeft}>
                    <Text style={styles.historyUser}>{item.user?.name || 'Fan'}</Text>
                    <Text style={styles.historySeat}>
                      {item.seat?.seatLabel} ({item.seat?.category?.toUpperCase()})
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <Text style={styles.historyTime}>
                      {formatTimeInNepal(item.entryTime || item.createdAt, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={styles.successBadge}>
                      <Text style={styles.successBadgeText}>APPROVED</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  // Camera
  cameraContainer: {
    height: 320,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
    ...shadows.lg,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scanFrame: {
    width: 220,
    height: 220,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.primaryLight,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 6 },
  scanLabel: {
    color: '#FFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
    marginTop: spacing.xl,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  closeCameraBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  closeCameraText: {
    color: '#FFF',
    fontSize: typography.caption.fontSize,
    fontWeight: '700',
  },

  // Permission states
  permissionLoading: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  permissionText: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  permissionDenied: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  permissionIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  permissionTitle: {
    color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
  },
  permissionDesc: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    lineHeight: 18,
  },
  permissionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  permissionBtnText: {
    color: '#FFF',
    fontSize: typography.captionMedium.fontSize,
    fontWeight: '700',
  },

  // Camera prompt (when scanner not active)
  scannerWrapper: {
    marginBottom: spacing.xl,
  },
  cameraPrompt: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...shadows.md,
  },
  cameraPromptInner: {
    alignItems: 'center',
  },
  cameraPromptEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  cameraPromptTitle: {
    color: colors.primaryLight,
    fontSize: typography.bodyMedium.fontSize,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  cameraPromptDesc: {
    color: colors.textMuted,
    fontSize: typography.caption.fontSize,
  },

  // Error banner
  errorBanner: {
    backgroundColor: colors.dangerSurface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.danger}30`,
  },
  errorBannerText: {
    color: colors.dangerLight,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },

  // Manual entry
  manualEntryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  cardHeader: {
    color: colors.textMuted,
    ...typography.tiny,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  cardDesc: {
    color: colors.textSecondary,
    ...typography.small,
    marginBottom: spacing.lg,
  },
  inputField: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    ...shadows.sm,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    ...typography.body,
    fontWeight: '800',
  },

  // History
  historyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  emptyHistory: {
    color: colors.textSecondary,
    ...typography.caption,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  historyList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  historyLeft: {
    flex: 1,
  },
  historyUser: {
    color: colors.textPrimary,
    ...typography.body,
    fontWeight: '700',
  },
  historySeat: {
    color: colors.textSecondary,
    ...typography.small,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyTime: {
    color: colors.textMuted,
    ...typography.small,
  },
  successBadge: {
    backgroundColor: colors.successSurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  successBadgeText: {
    color: colors.success,
    ...typography.tiny,
    fontWeight: '800',
  },
});
