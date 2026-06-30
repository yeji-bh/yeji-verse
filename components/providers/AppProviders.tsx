"use client";

import { ThemeProvider } from "./ThemeProvider";
import { LocaleProvider } from "./LocaleProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  );
}
