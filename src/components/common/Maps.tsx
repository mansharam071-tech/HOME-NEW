import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LatLng } from "@/lib/types";

const pin = (color: string, label: string) =>
  L.divIcon({
    className: "custom-map-pin",
    html: `<div style="background:${color};color:#fff;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.35);width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-weight:700;font-size:12px;font-family:Inter,sans-serif">${label}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

export const TrackMap: React.FC<{
  dest?: LatLng | null;
  partner?: LatLng | null;
  className?: string;
  testid?: string;
}> = ({ dest, partner, className = "h-full w-full", testid }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = dest?.lat || partner?.lat || 26.8467;
      const initialLng = dest?.lng || partner?.lng || 80.9462;

      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialLat, initialLng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous layers other than tile layer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    const latlngs: L.LatLngExpression[] = [];

    if (dest) {
      const destPos: [number, number] = [dest.lat, dest.lng];
      L.marker(destPos, { icon: pin("#1E3A8A", "Home") }).addTo(map);
      latlngs.push(destPos);
    }

    if (partner) {
      const partPos: [number, number] = [partner.lat, partner.lng];
      L.marker(partPos, { icon: pin("#F59E0B", "Pro") }).addTo(map);
      latlngs.push(partPos);
    }

    if (dest && partner) {
      const poly = L.polyline(
        [
          [partner.lat, partner.lng],
          [dest.lat, dest.lng],
        ],
        {
          color: "#1E3A8A",
          weight: 4,
          dashArray: "6, 8",
        }
      ).addTo(map);
      map.fitBounds(poly.getBounds(), { padding: [40, 40] });
    } else if (latlngs.length > 0) {
      map.setView(latlngs[0], 14);
    }

    return () => {
      // Map cleanup on unmount
    };
  }, [dest?.lat, dest?.lng, partner?.lat, partner?.lng]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div data-testid={testid} className={className}>
      <div ref={containerRef} className="h-full w-full rounded-2xl overflow-hidden min-h-[220px]" />
    </div>
  );
};

export const GeofenceMap: React.FC<{
  polygon: [number, number][];
  onChange: (poly: [number, number][]) => void;
  center?: LatLng;
  others?: [number, number][][];
  testid?: string;
}> = ({ polygon, onChange, center, others = [], testid }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const c = center || { lat: 26.8467, lng: 80.9462 };
      const map = L.map(containerRef.current).setView([c.lat, c.lng], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: L.LeafletMouseEvent) => {
        const pt: [number, number] = [
          Number(e.latlng.lat.toFixed(5)),
          Number(e.latlng.lng.toFixed(5)),
        ];
        onChange([...polygon, pt]);
      });

      mapRef.current = map;
    }

    const map = mapRef.current;
    if (!map) return;

    // Remove existing vectors
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    // Render others
    others.forEach((o) => {
      if (o.length > 2) {
        L.polygon(o, { color: "#94A3B8", weight: 1, fillOpacity: 0.1 }).addTo(map);
      }
    });

    // Render current polygon
    if (polygon.length > 2) {
      L.polygon(polygon, {
        color: "#1E3A8A",
        fillColor: "#F59E0B",
        fillOpacity: 0.25,
        weight: 3,
      }).addTo(map);
    } else if (polygon.length === 2) {
      L.polyline(polygon, { color: "#1E3A8A", weight: 3 }).addTo(map);
    }

    polygon.forEach((p, idx) => {
      L.marker(p, { icon: pin(idx === 0 ? "#22C55E" : "#1E3A8A", String(idx + 1)) }).addTo(map);
    });

    if (center) {
      map.setView([center.lat, center.lng], 12);
    }
  }, [polygon, center, others]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div data-testid={testid} className="h-full w-full">
      <div ref={containerRef} className="h-full w-full rounded-2xl overflow-hidden min-h-[300px]" />
    </div>
  );
};
