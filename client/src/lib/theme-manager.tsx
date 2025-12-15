import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ThemePreset, ThemeColors, ThemeLayout, ThemeFooter, ThemeDashboard } from "@shared/schema";

type ColorMode = "light" | "dark";

type ThemeManagerContextType = {
  activeTheme: {
    id: number;
    name: string;
    key: string;
    preset: ThemePreset;
  } | null;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  layoutType: "sidebar" | "top-nav";
  isLoading: boolean;
  colors: ThemeColors;
  layout: ThemeLayout;
  footer: ThemeFooter | undefined;
  dashboard: ThemeDashboard | undefined;
};

const defaultColors: ThemeColors = {
  primary: "217 91% 32%",
  primaryForeground: "210 20% 98%",
  secondary: "210 18% 86%",
  secondaryForeground: "210 15% 16%",
  background: "210 20% 98%",
  foreground: "210 15% 12%",
  card: "210 18% 96%",
  cardForeground: "210 15% 12%",
  muted: "210 16% 90%",
  mutedForeground: "210 12% 28%",
  accent: "210 16% 92%",
  accentForeground: "210 15% 16%",
  destructive: "0 84% 32%",
  destructiveForeground: "0 20% 98%",
  border: "210 15% 90%",
  sidebar: "210 18% 94%",
  sidebarForeground: "210 15% 14%",
  sidebarPrimary: "217 91% 48%",
  sidebarAccent: "210 18% 88%",
};

const defaultDarkColors: ThemeColors = {
  primary: "217 91% 48%",
  primaryForeground: "210 20% 98%",
  secondary: "210 16% 20%",
  secondaryForeground: "210 15% 86%",
  background: "210 18% 8%",
  foreground: "210 15% 92%",
  card: "210 16% 10%",
  cardForeground: "210 15% 92%",
  muted: "210 14% 16%",
  mutedForeground: "210 10% 68%",
  accent: "210 14% 18%",
  accentForeground: "210 15% 86%",
  destructive: "0 84% 40%",
  destructiveForeground: "0 20% 98%",
  border: "210 12% 18%",
  sidebar: "210 16% 12%",
  sidebarForeground: "210 15% 88%",
  sidebarPrimary: "217 91% 48%",
  sidebarAccent: "210 16% 18%",
};

const defaultLayout: ThemeLayout = {
  type: "sidebar",
  sidebarWidth: "18rem",
  borderRadius: "0.5rem",
};

const ThemeManagerContext = createContext<ThemeManagerContextType | undefined>(undefined);

// Safe localStorage wrapper for iOS Safari private browsing
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail on iOS Safari private browsing
  }
}

function applyColorsToDocument(colors: ThemeColors, isDark: boolean) {
  const root = document.documentElement;
  
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--card-foreground", colors.cardForeground);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--destructive", colors.destructive);
  root.style.setProperty("--destructive-foreground", colors.destructiveForeground);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--sidebar", colors.sidebar);
  root.style.setProperty("--sidebar-foreground", colors.sidebarForeground);
  root.style.setProperty("--sidebar-primary", colors.sidebarPrimary);
  root.style.setProperty("--sidebar-accent", colors.sidebarAccent);
  
  root.classList.remove("light", "dark");
  root.classList.add(isDark ? "dark" : "light");
}

type ActiveThemeResponse = {
  id: number;
  name: string;
  key: string;
  preset: ThemePreset;
} | null;

export function ThemeManagerProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    if (typeof window !== "undefined") {
      const stored = safeGetItem("colorMode") as ColorMode;
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  const { data: activeTheme, isLoading } = useQuery<ActiveThemeResponse>({
    queryKey: ["/api/theme/active"],
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const getColors = (): ThemeColors => {
    const baseDefaults = colorMode === "dark" ? defaultDarkColors : defaultColors;
    if (!activeTheme?.preset) return baseDefaults;
    
    const presetColors = colorMode === "dark" && activeTheme.preset.darkColors
      ? activeTheme.preset.darkColors
      : activeTheme.preset.colors;
    
    return {
      ...baseDefaults,
      ...presetColors,
    };
  };
  
  const colors = getColors();

  const layout = activeTheme?.preset?.layout || defaultLayout;

  useEffect(() => {
    applyColorsToDocument(colors, colorMode === "dark");
    safeSetItem("colorMode", colorMode);
  }, [colors, colorMode]);

  useEffect(() => {
    if (layout.borderRadius) {
      document.documentElement.style.setProperty("--radius", layout.borderRadius);
    }
    if (layout.sidebarWidth) {
      document.documentElement.style.setProperty("--sidebar-width", layout.sidebarWidth);
    }
  }, [layout]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState(prev => prev === "light" ? "dark" : "light");
  }, []);

  const value: ThemeManagerContextType = {
    activeTheme: activeTheme || null,
    colorMode,
    setColorMode,
    toggleColorMode,
    layoutType: layout.type,
    isLoading,
    colors,
    layout,
    footer: activeTheme?.preset?.footer,
    dashboard: activeTheme?.preset?.dashboard,
  };

  return (
    <ThemeManagerContext.Provider value={value}>
      {children}
    </ThemeManagerContext.Provider>
  );
}

export function useThemeManager() {
  const context = useContext(ThemeManagerContext);
  if (!context) {
    throw new Error("useThemeManager must be used within a ThemeManagerProvider");
  }
  return context;
}
