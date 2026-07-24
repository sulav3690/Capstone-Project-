// Node 22+ may expose a partial localStorage global when no storage file is
// configured. Browser storage has no place in SSR, so remove that global before
// Next.js or one of its workers can inspect it.
if (typeof window === 'undefined' && 'localStorage' in globalThis) {
  delete globalThis.localStorage;
}
