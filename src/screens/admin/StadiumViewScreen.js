import React, { useState } from 'react';
import { Modal, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Text as SvgText, Line, G } from 'react-native-svg';
import ScreenHeader from '../../components/ScreenHeader';
import { colors, spacing, radii, typography, glass, CATEGORY_COLORS } from '../../constants/theme';

const STADIUM_OUTLINE = 'M50,30 Q200,0 350,30 Q380,175 350,320 Q200,350 50,320 Q20,175 50,30 Z';
const PITCH = { x: 120, y: 100, w: 160, h: 150 };

function parsePath(d) {
  const re = /[ML](-?\d+\.?\d*),(-?\d+\.?\d*)/g;
  const pts = [];
  let m;
  while ((m = re.exec(d)) !== null) pts.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) });
  return pts;
}

function computeViewBox(sections) {
  let minX = 0, minY = 0, maxX = 400, maxY = 350;
  const allPoints = parsePath(STADIUM_OUTLINE);
  for (const s of sections) {
    if (s.polygon) allPoints.push(...parsePath(s.polygon));
  }
  for (const p of allPoints) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const pad = 30;
  return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
}

export default function StadiumViewScreen({ navigation, route }) {
  const { venue } = route.params || {};
  const sections = venue?.stadiumSections || [];
  const sectionsWithPolygons = sections.filter((s) => s.polygon);
  const viewBox = computeViewBox(sections);
  const [selectedSection, setSelectedSection] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScreenHeader
        title={venue?.name || 'Stadium Layout'}
        subtitle={venue?.location || 'Read-only view'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.svgCard}>
          <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={styles.svg}>
            <Path d={STADIUM_OUTLINE} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <Rect x={PITCH.x} y={PITCH.y} width={PITCH.w} height={PITCH.h} fill="#1B5E20" stroke="rgba(255,255,255,0.3)" strokeWidth={1} rx={4} />
            <SvgText x={PITCH.x + PITCH.w / 2} y={PITCH.y + PITCH.h / 2} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={12} fontWeight="800">PITCH</SvgText>

            {[100, 200, 300].map((x) => (
              <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={350} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            ))}
            {[100, 200, 300].map((y) => (
              <Line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            ))}

            {sectionsWithPolygons.map((section) => (
              <G key={section.sectionId} onPress={() => setSelectedSection(section)}>
                <Path d={section.polygon} fill={`${section.color || '#888'}30`} stroke={section.color || '#888'} strokeWidth={1.5} />
              </G>
            ))}

            {sectionsWithPolygons.length === 0 && (
              <SvgText x={200} y={175} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={12} fontWeight="700">
                No sections drawn
              </SvgText>
            )}
          </Svg>
        </View>

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Sections</Text>
          {sections.map((section) => {
            const catData = CATEGORY_COLORS[section.category];
            return (
              <View key={section.sectionId} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: section.color || catData?.accent || '#888' }]} />
                <Text style={styles.legendLabel}>{section.sectionId || 'Unnamed'}</Text>
                <Text style={styles.legendCategory}>{catData?.label || section.category}</Text>
                <Text style={styles.legendSeats}>{section.totalSeats || 0} seats</Text>
                <Text style={styles.legendPrice}>Rs {section.pricePerTicket || 0}</Text>
              </View>
            );
          })}
          {sections.length === 0 && (
            <Text style={styles.emptyText}>No sections defined for this venue</Text>
          )}
        </View>
      </ScrollView>

      <Modal visible={!!selectedSection} animationType="slide" transparent onRequestClose={() => setSelectedSection(null)}>
        <View style={styles.detailOverlay}>
          <TouchableOpacity style={styles.detailBackdrop} onPress={() => setSelectedSection(null)} activeOpacity={1} />
          <View style={styles.detailSheet}>
            {selectedSection && (
              <>
                <View style={styles.detailHandle} />
                <View style={styles.detailHeader}>
                  <View style={[styles.detailDot, { backgroundColor: selectedSection.color || '#888' }]} />
                  <Text style={styles.detailTitle}>{selectedSection.sectionId}</Text>
                  <TouchableOpacity onPress={() => setSelectedSection(null)} hitSlop={8}>
                    <Text style={styles.detailClose}>Done</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{CATEGORY_COLORS[selectedSection.category]?.label || selectedSection.category}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Seats</Text>
                  <Text style={styles.detailValue}>{selectedSection.totalSeats || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Rows</Text>
                  <Text style={styles.detailValue}>{Array.isArray(selectedSection.rows) ? selectedSection.rows.join(', ') : selectedSection.rows}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price / Ticket</Text>
                  <Text style={[styles.detailValue, { color: glass.brandPurple }]}>Rs {selectedSection.pricePerTicket || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gate</Text>
                  <Text style={styles.detailValue}>{selectedSection.gate || '—'}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: glass.canvasStart },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },

  svgCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radii.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden', marginBottom: spacing.lg, height: 400,
  },
  svg: { width: '100%', height: '100%' },

  legendCard: {
    backgroundColor: glass.card, borderRadius: radii.xl,
    borderWidth: 1, borderColor: glass.border,
    padding: spacing.xl,
  },
  legendTitle: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '800', marginBottom: spacing.md },
  legendRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: colors.textPrimary, fontSize: typography.captionMedium.fontSize, fontWeight: '700', flex: 1 },
  legendCategory: { color: glass.textSecondary, fontSize: typography.small.fontSize, width: 70 },
  legendSeats: { color: glass.textSecondary, fontSize: typography.small.fontSize, width: 55, textAlign: 'right' },
  legendPrice: { color: glass.brandPurple, fontSize: typography.small.fontSize, fontWeight: '700', width: 60, textAlign: 'right' },
  emptyText: { color: glass.textMuted, fontSize: typography.small.fontSize, textAlign: 'center', paddingVertical: spacing.lg },

  detailOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  detailSheet: {
    backgroundColor: '#0D0F18', borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    padding: spacing.xxl, paddingBottom: spacing.huge,
    borderWidth: 1, borderColor: glass.border, borderBottomWidth: 0,
    zIndex: 1,
  },
  detailHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: glass.textMuted, alignSelf: 'center', marginBottom: spacing.xl },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  detailDot: { width: 14, height: 14, borderRadius: 7 },
  detailTitle: { color: colors.textPrimary, fontSize: typography.h3.fontSize, fontWeight: '800', flex: 1 },
  detailClose: { color: colors.textPrimary, fontSize: typography.bodyMedium.fontSize, fontWeight: '700' },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  detailLabel: { color: glass.textSecondary, fontSize: typography.body.fontSize, fontWeight: '600' },
  detailValue: { color: colors.textPrimary, fontSize: typography.body.fontSize, fontWeight: '700', fontFamily: glass.monoFont },
});
