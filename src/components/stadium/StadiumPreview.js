import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Text as SvgText, Line } from 'react-native-svg';
import { spacing, radii } from '../../constants/theme';

const STADIUM_OUTLINE = 'M50,30 Q200,0 350,30 Q380,175 350,320 Q200,350 50,320 Q20,175 50,30 Z';
const PITCH = { x: 120, y: 100, w: 160, h: 150 };

function parsePath(d) {
  const re = /[ML](-?\d+\.?\d*),(-?\d+\.?\d*)/g;
  const pts = [];
  let m;
  while ((m = re.exec(d)) !== null) pts.push({ x: parseFloat(m[1]), y: parseFloat(m[2]) });
  return pts;
}

export default function StadiumPreview({ sections = [] }) {
  const sectionsWithPolygons = sections.filter((s) => s.polygon);

  if (sectionsWithPolygons.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 400 350" style={styles.svg}>
        <Path d={STADIUM_OUTLINE} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        <Rect x={PITCH.x} y={PITCH.y} width={PITCH.w} height={PITCH.h} fill="#1B5E20" stroke="rgba(255,255,255,0.3)" strokeWidth={1} rx={4} />
        <SvgText x={PITCH.x + PITCH.w / 2} y={PITCH.y + PITCH.h / 2} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={12} fontWeight="800">PITCH</SvgText>

        {[100, 200, 300].map((x) => (
          <Line key={`v${x}`} x1={x} y1={0} x2={x} y2={350} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        ))}
        {[100, 200, 300].map((y) => (
          <Line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
        ))}

        {sectionsWithPolygons.map((section) => {
          const pts = parsePath(section.polygon);
          const cx = pts.length ? pts.reduce((s, p) => s + p.x, 0) / pts.length : 200;
          const cy = pts.length ? pts.reduce((s, p) => s + p.y, 0) / pts.length : 175;
          return (
            <React.Fragment key={section.sectionId}>
              <Path d={section.polygon} fill={`${section.color || '#888'}30`} stroke={section.color || '#888'} strokeWidth={1.5} />
              <SvgText x={cx} y={cy + 3} textAnchor="middle" fill="#FFF" fontSize={8} fontWeight="700">
                {section.sectionId || ''}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: radii.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden', marginBottom: spacing.lg,
  },
  svg: { width: '100%', aspectRatio: 400 / 350 },
});
