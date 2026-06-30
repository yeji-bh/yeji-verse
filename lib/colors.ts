export type ThemeMode = "light" | "dark";

/** 主題色：藍色系 */
export const ACCENT = {
  light: "#2563eb",
  lightHover: "#1d4ed8",
  dark: "#3b82f6",
  darkHover: "#60a5fa",
} as const;

export const colors = {
  light: {
    bg: "#ffffff",
    bgElevated: "#ffffff",
    bgMuted: "#f4f4f5",
    bgOverlay: "rgba(0, 0, 0, 0.4)",
    border: "#e4e4e7",
    borderSubtle: "#f4f4f5",
    text: "#18181b",
    textMuted: "#71717a",
    textSubtle: "#a1a1aa",
    accent: ACCENT.light,
    accentHover: ACCENT.lightHover,
    accentMuted: "rgba(37, 99, 235, 0.1)",
    accentText: "#ffffff",
    badge: "#f4f4f5",
    badgeActive: ACCENT.light,
    badgeActiveText: "#ffffff",
    badgeText: "#52525b",
    card: "#ffffff",
    cardHover: "#fafafa",
    input: "#fafafa",
    shadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
    shadowLg: "0 16px 48px rgba(0, 0, 0, 0.1)",
    gradient: `linear-gradient(135deg, ${ACCENT.light} 0%, #6366f1 100%)`,
    scrollbar: "#d4d4d8",
  },
  dark: {
    bg: "#09090b",
    bgElevated: "#18181b",
    bgMuted: "#27272a",
    bgOverlay: "rgba(0, 0, 0, 0.7)",
    border: "#3f3f46",
    borderSubtle: "#27272a",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    textSubtle: "#71717a",
    accent: ACCENT.dark,
    accentHover: ACCENT.darkHover,
    accentMuted: "rgba(59, 130, 246, 0.15)",
    accentText: "#ffffff",
    badge: "#27272a",
    badgeActive: ACCENT.dark,
    badgeActiveText: "#ffffff",
    badgeText: "#d4d4d8",
    card: "#18181b",
    cardHover: "#27272a",
    input: "#27272a",
    shadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
    shadowLg: "0 16px 48px rgba(0, 0, 0, 0.55)",
    gradient: `linear-gradient(135deg, ${ACCENT.dark} 0%, #818cf8 100%)`,
    scrollbar: "#52525b",
  },
} as const;

export function applyTheme(mode: ThemeMode) {
  const palette = colors[mode];
  const root = document.documentElement;

  Object.entries(palette).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  root.classList.toggle("dark", mode === "dark");
  root.dataset.theme = mode;
}
