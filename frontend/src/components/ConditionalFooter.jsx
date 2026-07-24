"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';

const FOOTERLESS_ROUTES = new Set(['/admin', '/dashboard', '/faq', '/survey']);

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (FOOTERLESS_ROUTES.has(pathname) || pathname.startsWith('/payment')) return null;
  return <Footer />;
}
