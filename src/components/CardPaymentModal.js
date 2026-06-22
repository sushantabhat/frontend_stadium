import React from 'react';
import { ActivityIndicator, Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, spacing, radii, typography } from '../constants/theme';
import useCardPayment from '../hooks/useCardPayment';

export default function CardPaymentModal({ visible, amount, matchId, seatIds, onSuccess, onError, onClose }) {
  const {
    cardNumber, setCardNumber,
    cardHolderName, setCardHolderName,
    expiry, setExpiry,
    cvv, setCvv,
    showCvv, setShowCvv,
    errors,
    step,
    processing,
    brand,
    maskedNumber,
    shimmerBg,
    handlePay,
  } = useCardPayment({ amount, matchId, seatIds, onSuccess, onError });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>

        {step === 'verifying' ? (
          <View style={styles.verifyContainer}>
            <Animated.View style={[styles.verifyGlow, { backgroundColor: shimmerBg }]} />
            <View style={styles.verifyCard}>
              <Text style={styles.verifyCardBrand}>{brand?.label || 'BANK CARD'}</Text>
              <Text style={styles.verifyCardNumber}>{maskedNumber}</Text>
              <View style={styles.verifyCardRow}>
                <Text style={styles.verifyCardName}>{cardHolderName.toUpperCase()}</Text>
                <Text style={styles.verifyCardExpiry}>{expiry}</Text>
              </View>
            </View>
            <ActivityIndicator size="large" color={colors.primaryLight} style={{ marginTop: spacing.xxl }} />
            <Text style={styles.verifyTitle}>Verifying payment</Text>
            <Text style={styles.verifySubtitle}>Processing with your bank...</Text>
            <Text style={styles.verifyAmount}>Rs.{Math.round(amount)}</Text>
            <View style={styles.verifyDots}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotActive]} />
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Pay with Card</Text>
              <TouchableOpacity onPress={onClose} disabled={processing}>
                <Text style={styles.closeBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

              {/* Card Preview */}
              <View style={[styles.cardPreview, brand && { borderColor: brand.color }]}>
                <View style={styles.cardPreviewTop}>
                  <Text style={styles.cardChip}>💳</Text>
                  <Text style={[styles.cardBrand, brand && { color: brand.color }]}>
                    {brand?.label || 'CARD'}
                  </Text>
                </View>
                <Text style={styles.cardPreviewNumber}>{maskedNumber}</Text>
                <View style={styles.cardPreviewRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardPreviewMini}>CARD HOLDER</Text>
                    <Text style={styles.cardPreviewLabel}>{cardHolderName.toUpperCase() || 'YOUR NAME'}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardPreviewMini}>EXPIRES</Text>
                    <Text style={styles.cardPreviewLabel}>{expiry || 'MM/YY'}</Text>
                  </View>
                </View>
              </View>

              {/* Card Number */}
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={[styles.input, errors.number && styles.inputError]}
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="Visa: 4242 4242 4242 4242"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={19}
              />
              {errors.number && <Text style={styles.fieldError}>{errors.number}</Text>}

              {/* Card Holder */}
              <Text style={styles.label}>Card Holder Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={cardHolderName}
                onChangeText={setCardHolderName}
                placeholder="John Doe"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}

              {/* Expiry + CVV */}
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={[styles.input, errors.expiry && styles.inputError]}
                    value={expiry}
                    onChangeText={setExpiry}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  {errors.expiry && <Text style={styles.fieldError}>{errors.expiry}</Text>}
                </View>
                <View style={styles.halfField}>
                  <View style={styles.cvvLabelRow}>
                    <Text style={styles.label}>CVV</Text>
                    <TouchableOpacity onPress={() => setShowCvv(!showCvv)}>
                      <Text style={styles.cvvToggle}>{showCvv ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, errors.cvv && styles.inputError]}
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry={!showCvv}
                  />
                  {errors.cvv && <Text style={styles.fieldError}>{errors.cvv}</Text>}
                </View>
              </View>

              <View style={styles.securedBadge}>
                <Text style={styles.securedIcon}>🔒</Text>
                <Text style={styles.securedText}>Secured with 256-bit encryption</Text>
              </View>

              <View style={styles.testCards}>
                <Text style={styles.testCardsTitle}>Test cards</Text>
                <View style={styles.testCardRow}>
                  <Text style={styles.testCardBrand}>Visa</Text>
                  <Text style={styles.testCardNum}>4242 4242 4242 4242</Text>
                  <Text style={styles.testCardCvv}>3 CVV</Text>
                </View>
                <View style={styles.testCardRow}>
                  <Text style={styles.testCardBrand}>Mastercard</Text>
                  <Text style={styles.testCardNum}>5555 5555 5555 4444</Text>
                  <Text style={styles.testCardCvv}>3 CVV</Text>
                </View>
                <View style={styles.testCardRow}>
                  <Text style={styles.testCardBrand}>Amex</Text>
                  <Text style={styles.testCardNum}>3714 496353 98431</Text>
                  <Text style={styles.testCardCvv}>4 CVV</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Total</Text>
                <Text style={styles.footerAmount}>Rs.{Math.round(amount)}</Text>
              </View>
              <TouchableOpacity
                style={[styles.payBtn, processing && styles.payBtnDisabled]}
                onPress={handlePay}
                disabled={processing}
                activeOpacity={0.85}
              >
                {processing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.payBtnText}>Pay Rs.{Math.round(amount)}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: spacing.huge, paddingBottom: spacing.lg,
  },
  headerTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '700' },
  closeBtn: { color: colors.primaryLight, fontSize: typography.bodyMedium.fontSize, fontWeight: '600' },
  form: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  cardPreview: {
    backgroundColor: '#1A1A2E', borderRadius: radii.xl, padding: spacing.xxl,
    marginBottom: spacing.xxl, borderWidth: 1, borderColor: colors.border,
    shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  cardChip: { fontSize: 24 },
  cardBrand: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  cardPreviewNumber: { color: '#FFF', fontSize: 20, fontWeight: '600', letterSpacing: 2, marginBottom: spacing.lg, fontFamily: 'Courier' },
  cardPreviewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewMini: { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  cardPreviewLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  label: { color: colors.textSecondary, fontSize: typography.caption.fontSize, fontWeight: '700', marginBottom: spacing.sm, letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radii.lg, padding: spacing.lg, color: colors.textPrimary,
    fontSize: typography.bodyMedium.fontSize, marginBottom: spacing.lg,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  halfField: { flex: 1 },
  cvvLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cvvToggle: { color: colors.primaryLight, fontSize: typography.small.fontSize, fontWeight: '600' },
  securedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
  securedIcon: { fontSize: 14 },
  securedText: { color: colors.textMuted, fontSize: typography.small.fontSize, fontWeight: '500' },
  testCards: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.xl, borderWidth: 1, borderColor: colors.border },
  testCardsTitle: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: '700', marginBottom: spacing.sm, letterSpacing: 0.5 },
  testCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  testCardBrand: { color: colors.textPrimary, fontSize: typography.caption.fontSize, fontWeight: '700', width: 80 },
  testCardNum: { color: colors.textSecondary, fontSize: typography.small.fontSize, fontFamily: 'Courier', flex: 1 },
  testCardCvv: { color: colors.textMuted, fontSize: typography.small.fontSize, width: 48, textAlign: 'right' },
  footer: {
    padding: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  footerLabel: { color: colors.textMuted, fontSize: typography.caption.fontSize, fontWeight: '600' },
  footerAmount: { color: colors.textPrimary, fontSize: typography.h2.fontSize, fontWeight: '900' },
  payBtn: {
    backgroundColor: colors.primary, borderRadius: radii.lg, paddingVertical: spacing.lg,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#FFF', fontSize: typography.bodyMedium.fontSize, fontWeight: '800' },
  verifyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxxl },
  verifyGlow: {
    position: 'absolute', top: '20%', left: '10%', right: '10%', bottom: '40%',
    borderRadius: 100, opacity: 0.4,
  },
  verifyCard: {
    width: '100%', backgroundColor: '#1A1A2E', borderRadius: radii.xl, padding: spacing.xxl,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xxl,
    shadowColor: '#6C5CE7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  verifyCardBrand: { color: colors.primaryLight, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: spacing.lg },
  verifyCardNumber: { color: '#FFF', fontSize: 20, fontWeight: '600', letterSpacing: 2, marginBottom: spacing.lg, fontFamily: 'Courier' },
  verifyCardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  verifyCardName: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  verifyCardExpiry: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  verifyTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '700', marginTop: spacing.lg },
  verifySubtitle: { color: colors.textMuted, fontSize: typography.caption.fontSize, marginTop: spacing.sm },
  verifyAmount: { color: colors.primaryLight, fontSize: typography.h2.fontSize, fontWeight: '900', marginTop: spacing.lg },
  verifyDots: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primaryLight },
  inputError: { borderColor: '#FF4757', borderWidth: 1.5 },
  fieldError: { color: '#FF4757', fontSize: typography.small.fontSize, marginTop: -spacing.sm, marginBottom: spacing.md, marginLeft: spacing.xs },
});
