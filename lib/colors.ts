export type ThemeMode = "light" | "dark";

export const colors = {
  light: {
    bg: "#f8f7f5",
    bgElevated: "#ffffff",
    bgMuted: "#f0eeea",
    bgOverlay: "rgba(15, 14, 18, 0.45)",
    border: "#e4e0d8",
    borderSubtle: "#ece8e2",
    text: "#1a1814",
    textMuted: "#6b6560",
    textSubtle: "#9a948c",
    accent: "#c45c7a",
    accentHover: "#b04d68",
    accentMuted: "rgba(196, 92, 122, 0.12)",
    accentText: "#ffffff",
    badge: "#ebe7e1",
    badgeActive: "#c45c7a",
    badgeActiveText: "#ffffff",
    badgeText: "#4a4540",
    card: "#ffffff",
    cardHover: "#faf9f7",
    input: "#f5f3ef",
    shadow: "0 8px 32px rgba(26, 24, 20, 0.08)",
    shadowLg: "0 24px 64px rgba(26, 24, 20, 0.14)",
    gradient: "linear-gradient(135deg, #c45c7a 0%, #9b6b9e 50%, #7a6b8a 100%)",
    scrollbar: "#d4cfc7",
  },
  dark: {
    bg: "#0f0e12",
    bgElevated: "#18161c",
    bgMuted: "#211f26",
    bgOverlay: "rgba(0, 0, 0, 0.65)",
    border: "#2e2b34",
    borderSubtle: "#252329",
    text: "#f2f0ec",
    textMuted: "#a8a29c",
    textSubtle: "#6b6560",
    accent: "#e07a96",
    accentHover: "#f08aaa",
    accentMuted: "rgba(224, 122, 150, 0.15)",
    accentText: "#1a1216",
    badge: "#2a2830",
    badgeActive: "#e07a96",
    badgeActiveText: "#1a1216",
    badgeText: "#c8c2bc",
    card: "#1c1a22",
    cardHover: "#24222a",
    input: "#211f26",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
    shadowLg: "0 24px 64px rgba(0, 0, 0, 0.5)",
    gradient: "linear-gradient(135deg, #e07a96 0%, #b87aab 50%, #8a7a9e 100%)",
    scrollbar: "#3a3740",
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
