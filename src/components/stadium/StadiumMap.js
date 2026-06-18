import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, G, Text as SvgText, Rect } from 'react-native-svg';
import { colors, CATEGORY_COLORS } from '../../constants/theme';

const STADIUM_OUTLINE = 'M50,30 Q200,0 350,30 Q380,175 350,320 Q200,350 50,320 Q20,175 50,30 Z';
const PITCH = 'M120,120 L280,120 L280,230 L120,230 Z';

function computeGridPositions(sections, viewBox) {
  if (!sections.length) return [];
  const { w, h } = viewBox;
  const cx = w / 2;
  const cy = h / 2;

  const pw = w * 0.4;
  const ph = h * 0.32;
  const px1 = cx - pw / 2;
  const px2 = cx + pw / 2;
  const py1 = cy - ph / 2;
  const py2 = cy + ph / 2;

  const margin = 4;
  const topW = w - margin * 2;
  const botW = w - margin * 2;
  const leftH = h - margin * 2;
  const rightH = h - margin * 2;

  const totalPerimeter = topW + botW + leftH + rightH;

  return sections.map((section, i) => {
    const frac = i / sections.length;
    const dist = frac * totalPerimeter;
    let x, y;

    if (dist < topW) {
      x = margin + dist;
      y = 14;
    } else if (dist < topW + rightH) {
      x = w - 14;
      y = margin + (dist - topW);
    } else if (dist < topW + rightH + botW) {
      x = w - margin - (dist - topW - rightH);
      y = h - 14;
    } else {
      x = 14;
      y = h - margin - (dist - topW - rightH - botW);
    }

    const cellW = Math.min(w * 0.12, 46);
    const cellH = Math.min(h * 0.12, 40);

    return {
      ...section,
      _x: x,
      _y: y,
      _w: cellW,
      _h: cellH,
      _rectPath: `M${x - cellW / 2},${y - cellH / 2} L${x + cellW / 2},${y - cellH / 2} L${x + cellW / 2},${y + cellH / 2} L${x - cellW / 2},${y + cellH / 2} Z`,
    };
  });
}

export default function StadiumMap({
  sections,
  selectedSection,
  onSectionPress,
  showPrices = true,
}) {
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 400, h: 350 });

  const hasPolygons = sections.some((s) => s.polygon);
  const displaySections = hasPolygons ? sections : computeGridPositions(sections, viewBox);

  const handleZoomIn = useCallback(() => {
    setViewBox((prev) => ({
      x: prev.x + prev.w * 0.1,
      y: prev.y + prev.h * 0.1,
      w: prev.w * 0.8,
      h: prev.h * 0.8,
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewBox((prev) => ({
      x: prev.x - prev.w * 0.125,
      y: prev.y - prev.h * 0.125,
      w: prev.w * 1.25,
      h: prev.h * 1.25,
    }));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapWrapper}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          style={styles.svg}
        >
          <Path
            d={STADIUM_OUTLINE}
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />

          <Path
            d={PITCH}
            fill="#1B5E20"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          />
          <SvgText
            x={200}
            y={180}
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize={11}
            fontWeight="800"
          >
            PITCH
          </SvgText>

          {displaySections.map((section, idx) => {
            const isSelected = selectedSection?.sectionId === section.sectionId;
            const catInfo = CATEGORY_COLORS[section.category] || { accent: '#888' };
            const fillColor = isSelected ? catInfo.accent : `${catInfo.accent}40`;
            const strokeColor = isSelected ? catInfo.accent : `${catInfo.accent}60`;
            const opacity = section.availableSeats > 0 ? 1 : 0.35;
            const path = section.polygon || section._rectPath;
            if (!path) return null;

            const labelX = section.labelX || section._x || 0;
            const labelY = section.labelY || section._y || 0;

            return (
              <G key={section.sectionId || `section-${idx}`}>
                <Path
                  d={path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={opacity}
                  onPress={() => {
                    if (section.availableSeats > 0) {
                      onSectionPress(section);
                    }
                  }}
                />
                <SvgText
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fill={isSelected ? '#000' : '#FFF'}
                  fontSize={section.polygon ? 10 : 7}
                  fontWeight="800"
                  onPress={() => {
                    if (section.availableSeats > 0) {
                      onSectionPress(section);
                    }
                  }}
                >
                  {section.sectionId}
                </SvgText>
                {showPrices && section.pricePerTicket > 0 && (
                  <SvgText
                    x={labelX}
                    y={labelY + 12}
                    textAnchor="middle"
                    fill={isSelected ? '#000' : 'rgba(255,255,255,0.7)'}
                    fontSize={7}
                    fontWeight="700"
                    onPress={() => {
                      if (section.availableSeats > 0) {
                        onSectionPress(section);
                      }
                    }}
                  >
                    €{section.pricePerTicket}
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>
      </View>

      <View style={styles.zoomControls}>
        <View style={styles.zoomBtn}>
          <Text style={styles.zoomText} onPress={handleZoomIn}>+</Text>
        </View>
        <View style={styles.zoomBtn}>
          <Text style={styles.zoomText} onPress={handleZoomOut}>−</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  mapWrapper: {
    width: '100%',
    aspectRatio: 400 / 350,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    gap: 6,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
});
