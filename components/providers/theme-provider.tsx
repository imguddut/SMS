"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "agragati_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  // Initialize theme on mount from localStorage or system preference
  React.useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem(STORAGE_KEY) as Theme) || "light";
      setThemeState(savedTheme);

      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialResolved =
        savedTheme === "dark" || (savedTheme === "system" && systemPrefersDark)
          ? "dark"
          : "light";

      setResolvedTheme(initialResolved);

      if (initialResolved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Fallback to light
    }
    setMounted(true);
  }, []);

  // Handle system color scheme change
  React.useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const newResolved = e.matches ? "dark" : "light";
        setResolvedTheme(newResolved);
        if (newResolved === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const applyTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      // Also set cookie for SSR hints if needed
      document.cookie = `${STORAGE_KEY}=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore
    }

    setThemeState(newTheme);

    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextResolved =
      newTheme === "dark" || (newTheme === "system" && systemPrefersDark)
        ? "dark"
        : "light";

    setResolvedTheme(nextResolved);

    if (nextResolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
