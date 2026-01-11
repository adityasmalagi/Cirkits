import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'compact' | 'normal';

interface FontSizeContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  isCompact: boolean;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

const FONT_SIZE_KEY = 'cirkit-font-size';

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(FONT_SIZE_KEY) as FontSize) || 'compact';
    }
    return 'compact';
  });

  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
    
    // Apply font size class to document
    const root = document.documentElement;
    if (fontSize === 'normal') {
      root.classList.remove('font-compact');
      root.classList.add('font-normal');
    } else {
      root.classList.remove('font-normal');
      root.classList.add('font-compact');
    }
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize, isCompact: fontSize === 'compact' }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
