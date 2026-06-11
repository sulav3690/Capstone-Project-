// This file runs before Next.js initializes, on the server side only.
// It fixes the Node.js v22+ built-in localStorage issue where the global
// localStorage object exists but its methods are broken/non-functional.

export async function register() {
  if (typeof window === 'undefined') {
    // We're on the server - delete the broken Node.js built-in localStorage
    // Node.js v22+ exposes a localStorage global that requires --localstorage-file
    // to function properly. Without it, localStorage.getItem throws TypeError.
    if (typeof globalThis.localStorage !== 'undefined') {
      delete globalThis.localStorage;
    }
  }
}
