import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Icon } from "./ui";
import { colors } from "./theme";

type P = { lat: number; lng: number } | null | undefined;

const regionFor = (a: P, b: P) => {
  const pts = [a, b].filter(Boolean) as { lat: number; lng: number }[];
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2, longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.8), longitudeDelta: Math.max(0.02, (maxLng - minLng) * 1.8),
  };
};

export default function TrackMap({ dest, partner, height }: { dest: P; partner: P; height: number }) {
  const ref = useRef<MapView>(null);
  useEffect(() => {
    if (dest) ref.current?.animateToRegion(regionFor(dest, partner), 600);
  }, [dest, partner?.lat, partner?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!dest) return <View style={{ height, backgroundColor: colors.surfaceTertiary }} />;
  return (
    <View style={{ height }} testID="tracking-map">
      <MapView ref={ref} style={StyleSheet.absoluteFill} initialRegion={regionFor(dest, partner)} toolbarEnabled={false}>
        <Marker coordinate={{ latitude: dest.lat, longitude: dest.lng }} title="Your location">
          <View style={[styles.pin, { backgroundColor: colors.brand }]}><Icon name="home" size={16} color={colors.onBrand} /></View>
        </Marker>
        {partner && (
          <Marker coordinate={{ latitude: partner.lat, longitude: partner.lng }} title="Technician">
            <View style={[styles.pin, { backgroundColor: colors.brandSecondary }]}><Icon name="construct" size={16} color={colors.onBrandSecondary} /></View>
          </Marker>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.surfaceSecondary },
});
