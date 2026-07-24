/**
 * Next.js server-runtime fallback for Node versions that expose a partial
 * localStorage global. The process preload handles normal startup; this keeps
 * worker runtimes safe as well.
 */
export async function register() {
  if (typeof window !== 'undefined' || !('localStorage' in globalThis)) return;
  delete globalThis.localStorage;
}
