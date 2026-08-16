import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Ellipse, Line, Circle } from 'react-native-svg';

export default function StadiumPitch({ width = 300, height = 180 }) {
  const padX = 20;
  const padY = 15;
  const fieldW = width - padX * 2;
  const fieldH = height - padY * 2;
  const cx = width / 2;
  const cy = height / 2;
  const penaltyW = fieldW * 0.16;
  const penaltyH = fieldH * 0.44;
  const goalW = fieldW * 0.06;
  const goalH = fieldH * 0.18;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <Rect x={0} y={0} width={width} height={height} rx={12} fill="#1B5E20" />

        {/* Field outline */}
        <Rect
          x={padX} y={padY}
          width={fieldW} height={fieldH}
          fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5}
        />

        {/* Center line */}
        <Line
          x1={cx} y1={padY} x2={cx} y2={height - padY}
          stroke="rgba(255,255,255,0.35)" strokeWidth={1}
        />

        {/* Center circle */}
        <Circle cx={cx} cy={cy} r={fieldH * 0.18} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={3} fill="rgba(255,255,255,0.5)" />

        {/* Left penalty area */}
        <Rect
          x={padX} y={cy - penaltyH / 2}
          width={penaltyW} height={penaltyH}
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1}
        />

        {/* Left goal area */}
        <Rect
          x={padX} y={cy - goalH / 2}
          width={goalW} height={goalH}
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1}
        />

        {/* Right penalty area */}
        <Rect
          x={width - padX - penaltyW} y={cy - penaltyH / 2}
          width={penaltyW} height={penaltyH}
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1}
        />

        {/* Right goal area */}
        <Rect
          x={width - padX - goalW} y={cy - goalH / 2}
          width={goalW} height={goalH}
          fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1}
        />

        {/* Corner arcs */}
        <Circle cx={padX} cy={padY} r={6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} startAngle={0} endAngle={Math.PI / 2} />
        <Circle cx={width - padX} cy={padY} r={6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} startAngle={Math.PI / 2} endAngle={Math.PI} />
        <Circle cx={padX} cy={height - padY} r={6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} startAngle={-Math.PI / 2} endAngle={0} />
        <Circle cx={width - padX} cy={height - padY} r={6} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} startAngle={Math.PI} endAngle={1.5 * Math.PI} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
