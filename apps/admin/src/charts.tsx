import React, { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { colors, fonts, CHART_COLORS } from "./theme";

type Pt = { label: string; bookings: number; revenue: number };

const path = (vals: number[], w: number, h: number, pad: number) => {
  const max = Math.max(...vals, 1);
  const step = (w - pad * 2) / Math.max(vals.length - 1, 1);
  return vals.map((v, i) => `${i ? "L" : "M"}${pad + i * step},${h - 20 - (v / max) * (h - 36)}`).join(" ");
};

export const TrendChart = ({ data, height = 180 }: { data: Pt[]; height?: number }) => {
  const [w, setW] = useState(0);
  const pad = 8;
  const every = Math.ceil(data.length / 5);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }} testID="trend-line-chart">
      {w > 0 && (
        <Svg width={w} height={height}>
          {[0, 1, 2, 3].map((i) => {
            const y = 16 + (i * (height - 36)) / 3;
            return <Line key={i} x1={0} x2={w} y1={y} y2={y} stroke={colors.border} strokeDasharray="4 4" />;
          })}
          <Path d={path(data.map((d) => d.revenue), w, height, pad)} stroke={colors.brand} strokeWidth={3} fill="none" strokeLinejoin="round" />
          <Path d={path(data.map((d) => d.bookings), w, height, pad)} stroke={colors.brandSecondary} strokeWidth={3} fill="none" strokeLinejoin="round" />
          {data.map((d, i) => (i % every === 0 ? (
            <SvgText key={d.label} x={pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1)} y={height - 4} fontSize={10}
              fill={colors.muted} fontFamily={fonts.text} textAnchor={i === 0 ? "start" : "middle"}>{d.label}</SvgText>
          ) : null))}
        </Svg>
      )}
    </View>
  );
};

export const Donut = ({ data, size = 140 }: { data: { name: string; value: number }[]; size?: number }) => {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <Svg width={size} height={size} testID="category-pie-chart">
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceTertiary} strokeWidth={18} fill="none" />
      {data.map((d, i) => {
        const len = (d.value / total) * c;
        const el = (
          <Circle key={d.name} cx={size / 2} cy={size / 2} r={r} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={18} fill="none"
            strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-acc} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        );
        acc += len;
        return el;
      })}
    </Svg>
  );
};
