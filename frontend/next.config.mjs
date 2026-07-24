const DEVELOPMENT_PHASE = 'phase-development-server';

/** @type {import('next').NextConfig} */
const baseConfig = {
  // Keep development diagnostics strict while optimizing the production bundle.
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default function createNextConfig(phase) {
  return {
    ...baseConfig,
    // Production builds must not overwrite chunks used by the live dev server.
    distDir: phase === DEVELOPMENT_PHASE ? '.next-dev' : '.next',
  };
}
