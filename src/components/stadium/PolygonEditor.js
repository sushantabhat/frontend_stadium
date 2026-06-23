import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import Svg, { Path, Circle, G, Text as SvgText, Rect, Line } from 'react-native-svg';
import { colors, spacing, radii, typography } from '../../constants/theme';

const STADIUM_OUTLINE = 'M50,30 Q200,0 350,30 Q380,175 350,320 Q200,350 50,320 Q20,175 50,30 Z';
const PITCH = { x: 120, y: 100, w: 160, h: 150 };

const PRESETS = [
  { id: 'north', label: 'North Stand', color: '#FF6B6B', path: 'M130,45 L270,45 L280,70 L120,70 Z' },
  { id: 'south', label: 'South Stand', color: '#FF6B6B', path: 'M120,280 L280,280 L270,305 L130,305 Z' },
  { id: 'west-u', label: 'West Upper', color: '#A29BFE', path: 'M25,80 L55,80 L48,165 L18,165 Z' },
  { id: 'west-l', label: 'West Lower', color: '#A29BFE', path: 'M18,185 L48,185 L40,270 L10,270 Z' },
  { id: 'east-u', label: 'East Upper', color: '#A29BFE', path: 'M345,80 L375,80 L382,165 L352,165 Z' },
  { id: 'east-l', label: 'East Lower', color: '#A29BFE', path: 'M352,185 L382,185 L390,270 L360,270 Z' },
  { id: 'nw', label: 'NW Corner', color: '#EF5350', path: 'M80,55 L120,42 L125,75 L88,82 Z' },
  { id: 'ne', label: 'NE Corner', color: '#EF5350', path: 'M280,42 L320,55 L312,82 L275,75 Z' },
  { id: 'sw', label: 'SW Corner', color: '#EF5350', path: 'M88,268 L125,275 L120,308 L80,295 Z' },
  { id: 'se', label: 'SE Corner', color: '#EF5350', path: 'M275,275 L312,268 L320,295 L280,308 Z' },
  { id: 'sup-n', label: 'Supporters N', color: '#81C784', path: 'M140,18 L260,18 L270,35 L130,35 Z' },
  { id: 'sup-s', label: 'Supporters S', color: '#81C784', path: 'M130,315 L270,315 L260,332 L140,332 Z' },
];

function parsePath(d) {
  const re = /[ML](-?\d+\.?\d*),(-?\d+\.?\d*)/g;
  const pts = [];
  let m;
  while ((m = re.exec(d)) !== null) pts.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) });
  return pts;
}

function toPath(pts) {
  if (!pts.length) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${Math.round(p.x)},${Math.round(p.y)}`).join(' ') + ' Z';
}

function centroid(pts) {
  if (!pts.length) return { x: 200, y: 175 };
  return { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
}

export default function PolygonEditor({
  existingSections = [],
  initialPolygon = '',
  onPolygonChange,
  sectionColor = '#FFD700',
  sectionLabel = '',
  viewBox = { x: 0, y: 0, w: 400, h: 350 },
}) {
  const [points, setPoints] = useState(() => parsePath(initialPolygon));
  const [dragIdx, setDragIdx] = useState(null);

  const pointsRef = useRef(points);
  pointsRef.current = points;

  const layoutRef = useRef({ w: 380, h: 330 });

  const emitRef = useRef(null);
  const emit = useCallback((pts) => {
    const path = toPath(pts);
    if (emitRef.current) clearTimeout(emitRef.current);
    emitRef.current = setTimeout(() => onPolygonChange?.(path), 0);
  }, [onPolygonChange]);

  const selectPreset = useCallback((preset) => {
    const pts = parsePath(preset.path);
    setPoints(pts);
    pointsRef.current = pts;
    emit(pts);
  }, [emit]);

  const clear = useCallback(() => {
    setPoints([]);
    pointsRef.current = [];
    setDragIdx(null);
    onPolygonChange?.('');
  }, [onPolygonChange]);

  const moveAll = useCallback((dx, dy) => {
    setPoints((prev) => {
      const next = prev.map((p) => ({ x: p.x + dx, y: p.y + dy }));
      pointsRef.current = next;
      emit(next);
      return next;
    });
  }, [emit]);

  const scaleShape = useCallback((factor) => {
    setPoints((prev) => {
      const c = centroid(prev);
      const next = prev.map((p) => ({
        x: Math.round(c.x + (p.x - c.x) * factor),
        y: Math.round(c.y + (p.y - c.y) * factor),
      }));
      pointsRef.current = next;
      emit(next);
      return next;
    });
  }, [emit]);

  const touchToSvg = useCallback((lx, ly) => {
    const { w, h } = layoutRef.current;
    if (!w || !h) return null;
    return {
      x: (lx / w) * viewBox.w + viewBox.x,
      y: (ly / h) * viewBox.h + viewBox.y,
    };
  }, [viewBox]);

  const handleTouchStart = useCallback((evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    const svgPt = touchToSvg(locationX, locationY);
    if (!svgPt) return;

    const pts = pointsRef.current;
    if (pts.length === 0) return;

    let closest = 0;
    let minDist = Infinity;
    pts.forEach((p, i) => {
      const d = Math.hypot(p.x - svgPt.x, p.y - svgPt.y);
      if (d < minDist) { minDist = d; closest = i; }
    });

    if (minDist < 30) {
      setDragIdx(closest);
    }
  }, [touchToSvg]);

  const addPoint = useCallback(() => {
    setPoints((prev) => {
      if (prev.length < 2) return prev;
      const c = centroid(prev);
      const mid = {
        x: Math.round((prev[prev.length - 1].x + prev[0].x) / 2),
        y: Math.round((prev[prev.length - 1].y + prev[0].y) / 2),
      };
      const next = [...prev, mid];
      pointsRef.current = next;
      emit(next);
      return next;
    });
  }, [emit]);

  const removeLast = useCallback(() => {
    setPoints((prev) => {
      if (prev.length < 1) return prev;
      const next = prev.slice(0, -1);
      pointsRef.current = next;
      if (next.length === 0) {
        onPolygonChange?.('');
      } else {
        emit(next);
      }
      return next;
    });
  }, [emit, onPolygonChange]);

  const handleTouchMove = useCallback((evt) => {
    if (dragIdx === null) return;
    const { locationX, locationY } = evt.nativeEvent;
    const svgPt = touchToSvg(locationX, locationY);
    if (!svgPt) return;

    const prev = pointsRef.current;
    const next = [...prev];
    next[dragIdx] = { x: Math.round(svgPt.x), y: Math.round(svgPt.y) };
    pointsRef.current = next;
    setPoints(next);
  }, [dragIdx, touchToSvg]);

  const handleTouchEnd = useCallback(() => {
    if (dragIdx !== null) {
      emit(pointsRef.current);
      setDragIdx(null);
    }
  }, [dragIdx, emit]);

  const usedPaths = new Set(existingSections.map((s) => s.polygon).filter(Boolean));
  const available = PRESETS.filter((p) => !usedPaths.has(p.path));

  const path = toPath(points);
  const c = centroid(points);
  const col = sectionColor;

  return (
    <View style={styles.container}>
      <View style={styles.svgWrap}>
        <View
          style={StyleSheet.absoluteFill}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            layoutRef.current = { w: width, h: height };
          }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
          onResponderGrant={handleTouchStart}
          onResponderMove={handleTouchMove}
          onResponderRelease={handleTouchEnd}
          onResponderTerminate={handleTouchEnd}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            style={styles.svg}
          >
            <Path d={STADIUM_OUTLINE} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            <Rect x={PITCH.x} y={PITCH.y} width={PITCH.w} height={PITCH.h} fill="#1B5E20" stroke="rgba(255,255,255,0.3)" strokeWidth={1} rx={4} />
            <SvgText x={PITCH.x + PITCH.w / 2} y={PITCH.y + PITCH.h / 2} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={12} fontWeight="800">PITCH</SvgText>

            {[100, 200, 300].map((x) => (
              <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={350} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            ))}
            {[100, 200, 300].map((y) => (
              <Line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            ))}

            {existingSections.map((section, idx) => {
              if (!section.polygon) return null;
              return <Path key={section.sectionId || `e${idx}`} d={section.polygon} fill={`${section.color || '#888'}20`} stroke={`${section.color || '#888'}40`} strokeWidth={0.5} />;
            })}

            {path ? (
              <G>
                <Path d={path} fill={`${col}30`} stroke={col} strokeWidth={2} pointerEvents="none" />
                {points.map((p, i) => (
                  <G key={`pt-${i}`}>
                    <Circle cx={p.x} cy={p.y} r={10} fill={dragIdx === i ? `${col}50` : 'transparent'} pointerEvents="none" />
                    <Circle cx={p.x} cy={p.y} r={dragIdx === i ? 7 : 5} fill={dragIdx === i ? '#FFF' : col} stroke="#FFF" strokeWidth={1.5} pointerEvents="none" />
                  </G>
                ))}
                {points.length >= 3 && (
                  <SvgText x={c.x} y={c.y + 4} textAnchor="middle" fill="#FFF" fontSize={9} fontWeight="800" pointerEvents="none">
                    {points.length} pts
                  </SvgText>
                )}
              </G>
            ) : null}
          </Svg>
        </View>
      </View>

      {points.length > 0 && (
        <View style={styles.moveBar}>
          <View style={styles.moveRow}>
            <View style={styles.moveSpacer} />
            <TouchableOpacity style={styles.arrowBtn} onPress={() => moveAll(0, -10)} activeOpacity={0.6}>
              <Text style={styles.arrowText}>▲</Text>
            </TouchableOpacity>
            <View style={styles.moveSpacer} />
          </View>
          <View style={styles.moveRow}>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => moveAll(-10, 0)} activeOpacity={0.6}>
              <Text style={styles.arrowText}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scaleBtn} onPress={() => scaleShape(0.85)} activeOpacity={0.6}>
              <Text style={styles.scaleText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scaleBtn} onPress={() => scaleShape(1.15)} activeOpacity={0.6}>
              <Text style={styles.scaleText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.arrowBtn} onPress={() => moveAll(10, 0)} activeOpacity={0.6}>
              <Text style={styles.arrowText}>▶</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.moveRow}>
            <View style={styles.moveSpacer} />
            <TouchableOpacity style={styles.arrowBtn} onPress={() => moveAll(0, 10)} activeOpacity={0.6}>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
            <View style={styles.moveSpacer} />
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <View style={styles.infoRow}>
          <View style={[styles.badge, { backgroundColor: `${col}25`, borderColor: `${col}50` }]}>
            <View style={[styles.badgeDot, { backgroundColor: col }]} />
            <Text style={[styles.badgeText, { color: col }]}>{sectionLabel}</Text>
          </View>
          {points.length > 0 ? (
            <Text style={styles.pointCount}>{points.length} pts — drag dots to adjust</Text>
          ) : (
            <Text style={styles.pointCount}>Pick a preset to start</Text>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {available.map((preset) => (
            <TouchableOpacity key={preset.id} style={styles.presetChip} onPress={() => selectPreset(preset)} activeOpacity={0.7}>
              <View style={[styles.presetDot, { backgroundColor: preset.color }]} />
              <Text style={styles.presetLabel}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {points.length > 0 && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.pointBtn} onPress={addPoint} activeOpacity={0.7}>
              <Text style={styles.pointBtnText}>+ Add vertex</Text>
            </TouchableOpacity>
            {points.length >= 3 && (
              <TouchableOpacity style={styles.pointBtnOutline} onPress={removeLast} activeOpacity={0.7}>
                <Text style={styles.pointBtnTextOutline}>− Remove last</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearBtn} onPress={clear} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radii.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  svgWrap: { width: '100%', aspectRatio: 400 / 350, position: 'relative' },
  svg: { width: '100%', height: '100%' },
  moveBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  moveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  moveSpacer: { width: 44 },
  arrowBtn: { width: 40, height: 36, borderRadius: radii.sm, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.textPrimary, fontSize: 14 },
  scaleBtn: { width: 40, height: 36, borderRadius: radii.sm, backgroundColor: 'rgba(108,92,231,0.15)', borderWidth: 1, borderColor: 'rgba(108,92,231,0.4)', alignItems: 'center', justifyContent: 'center' },
  scaleText: { color: '#6C5CE7', fontSize: 16, fontWeight: '800' },
  controls: { padding: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.sm, borderWidth: 1 },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: typography.tiny.fontSize, fontWeight: '700' },
  pointCount: { color: colors.textMuted, fontSize: typography.small.fontSize, fontWeight: '600' },
  presetScroll: { marginBottom: spacing.sm },
  presetChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', marginRight: spacing.sm },
  presetDot: { width: 7, height: 7, borderRadius: 4 },
  presetLabel: { color: colors.textSecondary, fontSize: typography.tiny.fontSize, fontWeight: '700' },
  clearBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.sm, alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.1)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' },
  clearBtnText: { color: '#FF3B30', fontSize: typography.tiny.fontSize, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  pointBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.sm, alignItems: 'center', backgroundColor: '#6C5CE7', borderWidth: 1, borderColor: 'rgba(108,92,231,0.3)' },
  pointBtnText: { color: '#FFF', fontSize: typography.tiny.fontSize, fontWeight: '700' },
  pointBtnOutline: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.sm, alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.1)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' },
  pointBtnTextOutline: { color: '#FF3B30', fontSize: typography.tiny.fontSize, fontWeight: '700' },
});
