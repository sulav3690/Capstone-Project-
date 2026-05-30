import '../index.css';
import { ToastProvider } from '../components/ToastProvider';

export const metadata = {
  title: 'VeritasAI | AI Content & Misinformation Detector',
  description: 'AI detection software',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-bg-grey text-gray-800">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
