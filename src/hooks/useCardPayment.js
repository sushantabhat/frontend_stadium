import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { initiateCardPayment, confirmCardBooking } from '../services/bookingService';

const CARD_BRANDS = [
  { pattern: /^4/, label: 'VISA', color: '#1A1F71', lengths: [16, 18, 19], cvvLen: 3 },
  { pattern: /^5[1-5]/, label: 'MASTERCARD', color: '#F79E1B', lengths: [16], cvvLen: 3 },
  { pattern: /^3[47]/, label: 'AMEX', color: '#2E77BC', lengths: [15], cvvLen: 4 },
  { pattern: /^6(?:011|5)/, label: 'DISCOVER', color: '#FF6000', lengths: [16, 17, 18, 19], cvvLen: 3 },
];

function detectBrand(number) {
  const cleaned = number.replace(/\s/g, '');
  for (const brand of CARD_BRANDS) {
    if (brand.pattern.test(cleaned)) return brand;
  }
  return null;
}

function luhnCheck(num) {
  let sum = 0, alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = parseInt(num[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export default function useCardPayment({ amount, matchId, seatIds, onSuccess, onError }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('form');
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState({});
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step === 'verifying') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [step]);

  const brand = detectBrand(cardNumber);

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return cleaned;
  };

  const maskedNumber = cardNumber
    ? `•••• •••• •••• ${cardNumber.replace(/\s/g, '').slice(-4)}`
    : '•••• •••• •••• ••••';

  const shimmerBg = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(108,92,231,0.3)', 'rgba(108,92,231,0.6)'],
  });

  const clearFieldError = (field) => {
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    const cleanedNumber = cardNumber.replace(/\s/g, '');

    if (!cardHolderName.trim()) {
      newErrors.name = 'Card holder name is required';
    } else if (/[0-9]/.test(cardHolderName)) {
      newErrors.name = 'Name cannot contain numbers';
    }

    if (!cleanedNumber) {
      newErrors.number = 'Card number is required';
    } else if (!/^\d+$/.test(cleanedNumber)) {
      newErrors.number = 'Only digits allowed';
    } else {
      const b = detectBrand(cleanedNumber);
      if (!b) {
        newErrors.number = 'Use a test card (4242... Visa, 5555... MC, 3714... Amex)';
      } else if (!b.lengths.includes(cleanedNumber.length)) {
        newErrors.number = `Must be ${b.lengths.join(' or ')} digits for ${b.label}`;
      } else if (!luhnCheck(cleanedNumber)) {
        newErrors.number = 'Invalid card number (checksum failed)';
      }
    }

    if (!expiry || expiry.length < 5) {
      newErrors.expiry = 'Enter valid MM/YY';
    } else {
      const [em, ey] = expiry.split('/');
      const m = parseInt(em, 10);
      const y = parseInt(ey, 10);
      if (m < 1 || m > 12) {
        newErrors.expiry = 'Month must be 01–12';
      } else {
        const now = new Date();
        if (new Date(2000 + y, m, 0) < new Date(now.getFullYear(), now.getMonth(), 1)) {
          newErrors.expiry = 'Card has expired';
        }
      }
    }

    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d+$/.test(cvv)) {
      newErrors.cvv = 'Only digits allowed';
    } else {
      const b = detectBrand(cleanedNumber);
      const expected = b ? b.cvvLen : 3;
      if (cvv.length !== expected) {
        newErrors.cvv = `Must be ${expected} digits for this card`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;

    setStep('verifying');
    setProcessing(true);

    try {
      const cleanedNumber = cardNumber.replace(/\s/g, '');
      const [expiryMonth, expiryYear] = expiry.split('/');
      const initResult = await initiateCardPayment({
        cardNumber: cleanedNumber,
        cardHolderName: cardHolderName.trim(),
        expiryMonth,
        expiryYear: `20${expiryYear}`,
        cvv,
        amount,
      });

      await new Promise(r => setTimeout(r, 2000));

      const confirmResult = await confirmCardBooking(initResult.transactionId, matchId, seatIds);
      onSuccess(confirmResult);
    } catch (err) {
      setStep('form');
      onError(err.response?.data?.message || err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setCardNumber('');
    setCardHolderName('');
    setExpiry('');
    setCvv('');
    setErrors({});
    setStep('form');
    setProcessing(false);
  };

  return {
    cardNumber,
    setCardNumber: (t) => { setCardNumber(formatCardNumber(t)); clearFieldError('number'); },
    cardHolderName,
    setCardHolderName: (t) => { setCardHolderName(t.replace(/[0-9]/g, '')); clearFieldError('name'); },
    expiry,
    setExpiry: (t) => { setExpiry(formatExpiry(t)); clearFieldError('expiry'); },
    cvv,
    setCvv: (t) => { setCvv(t.replace(/\D/g, '').slice(0, 4)); clearFieldError('cvv'); },
    showCvv, setShowCvv,
    errors,
    step,
    processing,
    brand,
    maskedNumber,
    shimmerBg,
    handlePay,
    reset,
  };
}
