// src/hooks/useLocalStorageSync.js
import { useState, useEffect } from 'react';

export function useLocalStorageSync(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  // Listen for changes from other tabs/windows or same-tab navigation
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        setValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    // Also re-read when page becomes visible (after coming back from invoice page)
    const handleFocus = () => {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    // Initial read + cleanup
    handleFocus();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [key, initialValue]);

  return value;
}