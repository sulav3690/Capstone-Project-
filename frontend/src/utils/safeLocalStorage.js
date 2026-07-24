/**
 * Safe localStorage wrapper that handles SSR and restricted environments.
 * Use this instead of directly accessing window.localStorage.
 */
const getBrowserStorage = () => {
  try {
    if (typeof window === 'undefined') return null;

    const storage = window.localStorage;
    if (
      storage
      && typeof storage.getItem === 'function'
      && typeof storage.setItem === 'function'
      && typeof storage.removeItem === 'function'
    ) {
      return storage;
    }
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
  return null;
};

const safeLocalStorage = {
  getItem: (key) => {
    try {
      return getBrowserStorage()?.getItem(key) ?? null;
    } catch { /* SSR or restricted environment */ }
    return null;
  },
  setItem: (key, value) => {
    try {
      getBrowserStorage()?.setItem(key, value);
    } catch { /* SSR or restricted environment */ }
  },
  removeItem: (key) => {
    try {
      getBrowserStorage()?.removeItem(key);
    } catch { /* SSR or restricted environment */ }
  }
};

export default safeLocalStorage;
