import { useState, useEffect } from 'react';

const STORAGE_KEY = 'yearly-planner-font-size';
const MIN = 10;
const MAX = 28;
const DEFAULT = 16;

const clamp = (n) => Math.min(MAX, Math.max(MIN, Number(n)));

const getStored = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? clamp(n) : DEFAULT;
  } catch {
    return DEFAULT;
  }
};

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState(getStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(fontSize));
  }, [fontSize]);

  const setFontSize = (v) => {
    const n = typeof v === 'number' ? v : parseInt(v, 10);
    if (Number.isFinite(n)) setFontSizeState(clamp(n));
  };

  return { fontSize, setFontSize, minFontSize: MIN, maxFontSize: MAX };
}
