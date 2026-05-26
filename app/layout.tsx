import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const IS_PROD = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';

export const metadata: Metadata = {
  title: { default: 'GP RACING STORE — Spare Part Motor Racing', template: '%s | GP RACING' },
  description: 'Spare part motor racing berkualitas. Knalpot, suspensi, kampas rem, velg racing, aksesoris motor.',
  keywords: ['spare part motor', 'racing part', 'knalpot racing', 'suspensi motor', 'velg racing', 'gpracing'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://gpracingstore.com',
    siteName: 'GP RACING STORE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Barlow, sans-serif',
              fontSize: '14px',
              borderRadius: '0',
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid #333',
            },
            success: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#facc15', secondary: '#000' } },
          }}
        />
        <Script
          src={IS_PROD
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js'}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
