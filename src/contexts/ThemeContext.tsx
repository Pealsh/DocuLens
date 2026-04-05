'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

const THEME_STORAGE_KEY = 'doculens-theme';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

// null にしないことで Provider が存在しない SSR/HMR 過渡期もクラッシュしない
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 初期値は false（SSR と一致させて Hydration エラーを防ぐ）
  // 実際の値は useEffect でマウント後に DOM から同期する
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // マウント後にインラインスクリプトが設定した DOM クラスと同期
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // isDarkMode が変わるたびに DOM クラスと localStorage を同期
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // システム設定の変化を監視（localStorage に保存済みの場合は無視）
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!saved) {
        setIsDarkMode(e.matches);
      }
    };

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  return useContext(ThemeContext);
}
