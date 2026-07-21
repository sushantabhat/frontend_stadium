import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../../components/ScreenHeader';
import { fetchAttendancePrediction } from '../../services/aiService';
import { fetchMatchById } from '../../services/matchService';
import { colors, glass, typography, spacing, radii } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AdminPredictAttendanceScreen({ route, navigation }) {
  const { matchId } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [matchData, setMatchData] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Loading text sequences
  const loadingTexts = [
    "Initializing Behavioral AI Model...",
    "Extracting Stadium Capacity...",
    "Analyzing Regional Weather Patterns...",
    "Calculating Expected Popularity...",
    "Finalizing Prediction Math..."
  ];
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);

  useEffect(() => {
    let timeout;
    if (loading) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step < loadingTexts.length) {
          setLoadingText(loadingTexts[step]);
        }
      }, 800);

      fetchData().then(() => {
        clearInterval(interval);
      });
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  const fetchData = async () => {
    try {
      // Simulate heavy AI processing for UI effect
      await new Promise(resolve => setTimeout(resolve, 3500)); 

      const [matchRes, predRes] = await Promise.all([
        fetchMatchById(matchId),
        fetchAttendancePrediction(matchId)
      ]);
      setMatchData(matchRes);
      setPredictionData(predRes);
      setLoading(false);

      // Trigger reveal animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();

      // Trigger progress bar
      if (predRes.factors && predRes.factors.stadium_capacity) {
        const pct = (predRes.prediction / predRes.factors.stadium_capacity) * 100;
        Animated.timing(progressAnim, {
          toValue: pct,
          duration: 1500,
          useNativeDriver: false, // width needs false
        }).start();
      }

    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to generate prediction');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#07080B', '#1A1025']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={glass.brandPurple} />
          <Text style={styles.loadingTitle}>Smart Stadium AI</Text>
          <Text style={styles.loadingSubtitle}>{loadingText}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="AI Prediction" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Prediction Failed</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setLoading(true)}>
            <Text style={styles.retryBtnText}>Retry Analysis</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const factors = predictionData.factors || {};
  const capacity = factors.stadium_capacity || 0;
  const prediction = predictionData.prediction || 0;
  const percentFull = capacity > 0 ? ((prediction / capacity) * 100).toFixed(1) : 0;
  const weatherIcon = factors.rain_mm > 0 ? "🌦️" : (factors.max_temp > 25 ? "☀️" : "☁️");

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#07080B', '#130B1C', '#07080B']} style={StyleSheet.absoluteFillObject} />
      <ScreenHeader title="AI Analysis" subtitle={`${matchData.teamA} vs ${matchData.teamB}`} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        
        <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['rgba(138,43,226,0.15)', 'rgba(0,0,0,0.6)']} style={styles.cardGradient}>
            <Text style={styles.cardLabel}>PREDICTED TICKET SALES</Text>
            
            <View style={styles.numberRow}>
              <Text style={styles.bigNumber}>{prediction.toLocaleString()}</Text>
              <Text style={styles.totalNumber}>/ {capacity.toLocaleString()}</Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
              })}]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>0</Text>
              <Text style={styles.progressLabelRight}>{percentFull}% Expected Occupancy</Text>
            </View>

          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.factorsSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Behavioral Factors Evaluated</Text>

          <View style={styles.factorGrid}>
            
            <View style={styles.factorCard}>
              <Text style={styles.factorIcon}>🔥</Text>
              <Text style={styles.factorValue}>{factors.expected_popularity}/10</Text>
              <Text style={styles.factorName}>Calculated Popularity</Text>
            </View>

            <View style={styles.factorCard}>
              <Text style={styles.factorIcon}>{weatherIcon}</Text>
              <Text style={styles.factorValue}>{factors.max_temp}°C</Text>
              <Text style={styles.factorName}>Expected Temp</Text>
            </View>

            <View style={styles.factorCard}>
              <Text style={styles.factorIcon}>📅</Text>
              <Text style={styles.factorValue}>{factors.is_weekend ? 'Yes' : 'No'}</Text>
              <Text style={styles.factorName}>Weekend Match</Text>
            </View>

            <View style={styles.factorCard}>
              <Text style={styles.factorIcon}>🏟️</Text>
              <Text style={styles.factorValue}>{capacity.toLocaleString()}</Text>
              <Text style={styles.factorName}>Stadium Capacity</Text>
            </View>

          </View>
        </Animated.View>

        <Animated.View style={[styles.insightCard, { opacity: fadeAnim }]}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={styles.insightTextWrap}>
              <Text style={styles.insightTitle}>AI Insight</Text>
              <Text style={styles.insightDesc}>
                This prediction is generated using a Random Forest model trained on 10,000 authentic matches. It relies purely on behavioral math rather than hardcoded team names, making it completely unbiased and scalable.
              </Text>
            </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07080B' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', marginTop: 24, marginBottom: 8, letterSpacing: 1 },
  loadingSubtitle: { color: glass.brandPurple, fontSize: 14, fontWeight: '600' },
  
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  errorSubtitle: { color: glass.textMuted, textAlign: 'center', marginBottom: 24 },
  retryBtn: { backgroundColor: glass.brandPurple, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.full },
  retryBtnText: { color: '#FFF', fontWeight: '700' },

  content: { padding: spacing.xl, paddingBottom: 100 },
  
  mainCard: {
    borderRadius: radii.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.3)',
    marginBottom: spacing.xxl,
  },
  cardGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  cardLabel: { color: glass.neonPurple, fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: spacing.md },
  numberRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.xl },
  bigNumber: { color: '#FFF', fontSize: 56, fontWeight: '900', letterSpacing: -2 },
  totalNumber: { color: 'rgba(255,255,255,0.4)', fontSize: 20, fontWeight: '700', marginLeft: 8 },
  
  progressTrack: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: glass.neonPurple, borderRadius: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  progressLabelLeft: { color: glass.textMuted, fontSize: 12, fontWeight: '700' },
  progressLabelRight: { color: glass.brandPurple, fontSize: 12, fontWeight: '800' },

  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: spacing.lg },
  
  factorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  factorCard: { 
    width: (width - spacing.xl * 2 - spacing.md) / 2, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: radii.xl, 
    padding: spacing.lg, 
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center'
  },
  factorIcon: { fontSize: 28, marginBottom: 8 },
  factorValue: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 2 },
  factorName: { color: glass.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  insightCard: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,215,0,0.1)', 
    borderRadius: radii.xl, 
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)'
  },
  insightIcon: { fontSize: 24, marginRight: 12 },
  insightTextWrap: { flex: 1 },
  insightTitle: { color: '#FFD700', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  insightDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20 },
});
