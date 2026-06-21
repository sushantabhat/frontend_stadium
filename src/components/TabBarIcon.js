import React from 'react';
import { View, StyleSheet } from 'react-native';

const ACTIVE = '#10B981';
const INACTIVE = '#6B7280';

function Icon({ name, color }) {
  const c = color;
  switch (name) {
    case 'home':
      return (
        <View style={s.homeWrap}>
          <View style={[s.homeRoof, { borderBottomColor: c }]} />
          <View style={[s.homeBody, { backgroundColor: c }]} />
        </View>
      );
    case 'search':
      return (
        <View style={s.searchWrap}>
          <View style={[s.searchCircle, { borderColor: c }]} />
          <View style={[s.searchLine, { backgroundColor: c }]} />
        </View>
      );
    case 'ticket':
      return (
        <View style={[s.ticket, { borderColor: c }]}>
          <View style={[s.ticketNotch, { backgroundColor: c }]} />
        </View>
      );
    case 'person':
      return (
        <View style={s.personWrap}>
          <View style={[s.personHead, { backgroundColor: c }]} />
          <View style={[s.personBody, { backgroundColor: c }]} />
        </View>
      );
    case 'dashboard':
      return (
        <View style={s.gridWrap}>
          <View style={[s.gridSq, { backgroundColor: c }]} />
          <View style={[s.gridSq, { backgroundColor: c }]} />
          <View style={[s.gridSq, { backgroundColor: c }]} />
          <View style={[s.gridSq, { backgroundColor: c }]} />
        </View>
      );
    case 'camera':
      return (
        <View style={s.cameraWrap}>
          <View style={[s.cameraBody, { borderColor: c }]} />
          <View style={[s.cameraLens, { borderColor: c }]} />
        </View>
      );
    case 'wrench':
      return (
        <View style={s.wrenchWrap}>
          <View style={[s.wrenchShaft, { backgroundColor: c }]} />
          <View style={[s.wrenchHead, { borderColor: c }]} />
        </View>
      );
    case 'calendar':
      return (
        <View style={[s.cal, { borderColor: c }]}>
          <View style={[s.calHeader, { backgroundColor: c }]} />
          <View style={[s.calDot, { backgroundColor: c }]} />
          <View style={[s.calDot, { backgroundColor: c }]} />
        </View>
      );
    case 'users':
      return (
        <View style={s.usersWrap}>
          <View style={[s.userCircle, { backgroundColor: c }]} />
          <View style={[s.userCircleSecond, { borderColor: c }]} />
        </View>
      );
    case 'chart':
      return (
        <View style={s.chartWrap}>
          <View style={[s.chartBar1, { backgroundColor: c }]} />
          <View style={[s.chartBar2, { backgroundColor: c }]} />
          <View style={[s.chartBar3, { backgroundColor: c }]} />
        </View>
      );
    case 'alert':
      return (
        <View style={s.alertWrap}>
          <View style={[s.alertTriangle, { borderBottomColor: c }]} />
          <View style={[s.alertDot, { backgroundColor: c }]} />
        </View>
      );
    case 'shield':
      return (
        <View style={[s.shield, { borderColor: c }]}>
          <View style={[s.shieldCheck, { backgroundColor: c }]} />
        </View>
      );
    default:
      return <View style={[s.dot, { backgroundColor: c }]} />;
  }
}

export default function TabBarIcon({ name, focused }) {
  return <Icon name={name} color={focused ? ACTIVE : INACTIVE} />;
}

const S = 20;

const s = StyleSheet.create({
  dot: { width: 6, height: 6, borderRadius: 3 },

  /* Home */
  homeWrap: { width: S, height: S, alignItems: 'center', justifyContent: 'flex-end' },
  homeRoof: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginBottom: 1 },
  homeBody: { width: 12, height: 7, borderRadius: 1 },

  /* Search */
  searchWrap: { width: S, height: S, alignItems: 'center', justifyContent: 'center' },
  searchCircle: { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5 },
  searchLine: { width: 5, height: 1.5, borderRadius: 1, position: 'absolute', bottom: 4, right: 2, transform: [{ rotate: '45deg' }] },

  /* Ticket */
  ticket: { width: S, height: S * 0.7, borderWidth: 1.5, borderRadius: 3, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ticketNotch: { width: 4, height: 1.5, borderRadius: 1, position: 'absolute', top: -1 },

  /* Person */
  personWrap: { width: S, height: S, alignItems: 'center', justifyContent: 'center' },
  personHead: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  personBody: { width: 14, height: 6, borderRadius: 3 },

  /* Dashboard grid */
  gridWrap: { width: S, height: S, flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center', alignContent: 'center' },
  gridSq: { width: 8, height: 8, borderRadius: 2 },

  /* Camera */
  cameraWrap: { width: S, height: S, alignItems: 'center', justifyContent: 'center' },
  cameraBody: { width: 16, height: 12, borderRadius: 2, borderWidth: 1.5 },
  cameraLens: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, position: 'absolute' },

  /* Wrench */
  wrenchWrap: { width: S, height: S, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] },
  wrenchShaft: { width: 2, height: 12, borderRadius: 1 },
  wrenchHead: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, position: 'absolute', top: 0 },

  /* Calendar */
  cal: { width: S, height: S, borderWidth: 1.5, borderRadius: 2, paddingTop: 5, alignItems: 'center', gap: 2 },
  calHeader: { width: '100%', height: 3, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  calDot: { width: 3, height: 3, borderRadius: 1.5 },

  /* Users */
  usersWrap: { width: S, height: S, alignItems: 'center', justifyContent: 'center' },
  userCircle: { width: 9, height: 9, borderRadius: 5, zIndex: 1 },
  userCircleSecond: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, position: 'absolute', right: 0, bottom: 2 },

  /* Chart */
  chartWrap: { width: S, height: S, flexDirection: 'row', alignItems: 'flex-end', gap: 2, justifyContent: 'center' },
  chartBar1: { width: 4, height: 8, borderRadius: 1 },
  chartBar2: { width: 4, height: 13, borderRadius: 1 },
  chartBar3: { width: 4, height: 18, borderRadius: 1 },

  /* Alert */
  alertWrap: { width: S, height: S, alignItems: 'center', justifyContent: 'center' },
  alertTriangle: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 14, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  alertDot: { width: 3, height: 3, borderRadius: 1.5, position: 'absolute', bottom: 2 },

  /* Shield */
  shield: { width: S, height: S, borderWidth: 1.5, borderRadius: 4, borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', justifyContent: 'center' },
  shieldCheck: { width: 6, height: 3, borderLeftWidth: 1.5, borderBottomWidth: 1.5, transform: [{ rotate: '-45deg' }] },
});
