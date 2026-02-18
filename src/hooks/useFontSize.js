import { useState, useEffect } from 'react';

const STORAGE_KEY = 'yearly-planner-font-size';
const FONT_SIZES = ['small', 'medium', 'large'];

const getStored = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return FONT_SIZES.includes(v) ? v : 'medium';
  } catch {
    return 'medium';
  }
};

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState(getStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, fontSize);
  }, [fontSize]);

  const setFontSize = (v) => {
    if (FONT_SIZES.includes(v)) setFontSizeState(v);
  };

  return { fontSize, setFontSize };
}
