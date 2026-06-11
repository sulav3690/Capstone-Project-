// Preload script that runs before Next.js starts.
// Fixes Node.js v22+ built-in localStorage which is broken without --localstorage-file.
// The global localStorage exists but its methods (getItem, setItem, etc.) throw TypeError.

if (typeof window === 'undefined' && typeof globalThis.localStorage !== 'undefined') {
  try {
    // Test if localStorage actually works
    globalThis.localStorage.getItem('__test__');
  } catch (e) {
    // It's broken — remove it entirely so Next.js SSR doesn't crash
    delete globalThis.localStorage;
  }
}
