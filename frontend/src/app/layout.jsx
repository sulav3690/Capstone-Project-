import '../index.css';
import { ToastProvider } from '../components/ToastProvider';
import ConditionalFooter from '../components/ConditionalFooter';

export const metadata = {
  title: 'VeritasAI | AI Content & Misinformation Detector',
  description: 'Analyze text for AI-writing patterns and misinformation signals with private scan history.',
  icons: {
    icon: [
      { url: '/Vertias_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/Vertias_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/Vertias_io/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/Vertias_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/Vertias_io/site.webmanifest'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FDFBF7',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-bg-grey text-gray-800">
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <ConditionalFooter />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
