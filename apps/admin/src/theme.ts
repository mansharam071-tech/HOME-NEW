export const colors = {
  surface: "#F8FAFC",
  onSurface: "#0F172A",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#0F172A",
  surfaceTertiary: "#F1F5F9",
  onSurfaceTertiary: "#334155",
  surfaceInverse: "#0F172A",
  onSurfaceInverse: "#FFFFFF",
  brand: "#1E3A8A",
  onBrand: "#FFFFFF",
  brandPrimary: "#1E3A8A",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#F59E0B",
  onBrandSecondary: "#0F172A",
  brandTertiary: "#DBEAFE",
  onBrandTertiary: "#1E3A8A",
  success: "#22C55E",
  onSuccess: "#FFFFFF",
  warning: "#EAB308",
  onWarning: "#FFFFFF",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#3B82F6",
  onInfo: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  divider: "#F1F5F9",
  muted: "#64748B",
  // light tints derived from semantic tokens
  errorTint: "#FEF2F2",
  warningTint: "#FEFCE8",
  successTint: "#F0FDF4",
  amberTint: "#FFFBEB",
  backdrop: "rgba(15,23,42,0.45)",
};

export type Colors = typeof colors;
export const useTheme = () => colors;

export const fonts = {
  display: "Mukta-Medium",
  displayRegular: "Mukta-Regular",
  text: "Hind-Regular",
  textMedium: "Hind-Medium",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32, "3xl": 48 };
export const radius = { sm: 6, md: 12, lg: 20, pill: 999 };
export const type = { sm: 12, base: 14, lg: 16, xl: 20, "2xl": 24 };

export const CHART_COLORS = ["#1E3A8A", "#F59E0B", "#22C55E", "#EF4444", "#0EA5E9", "#8B5CF6", "#EAB308", "#64748B"];
