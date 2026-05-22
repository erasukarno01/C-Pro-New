import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

// Dark theme CSS variables
const darkThemeStyles = `
.dark {
  --background: oklch(0.15 0.02 250);
  --foreground: oklch(0.98 0 0);
  --card: oklch(0.2 0.02 250);
  --card-foreground: oklch(0.98 0 0);
  --popover: oklch(0.2 0.02 250);
  --popover-foreground: oklch(0.98 0 0);
  --primary: oklch(0.65 0.2 245);
  --primary-foreground: oklch(0.15 0.02 250);
  --secondary: oklch(0.25 0.02 250);
  --secondary-foreground: oklch(0.98 0 0);
  --muted: oklch(0.25 0.02 250);
  --muted-foreground: oklch(0.65 0.02 250);
  --accent: oklch(0.3 0.03 245);
  --accent-foreground: oklch(0.98 0 0);
  --destructive: oklch(0.6 0.2 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(0.3 0.02 250);
  --input: oklch(0.25 0.02 250);
  --ring: oklch(0.65 0.2 245);
}

.dark .bg-slate-50 { background-color: oklch(0.2 0.02 250); }
.dark .bg-slate-100 { background-color: oklch(0.25 0.02 250); }
.dark .text-muted-foreground { color: oklch(0.65 0.02 250); }
.dark .modern-card:hover { border-color: oklch(0.35 0.05 245); }
`;

// Inject dark theme styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = darkThemeStyles;
  document.head.appendChild(style);
}