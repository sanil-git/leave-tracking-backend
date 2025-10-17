import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RelocateWise - Plan Your Perfect Relocation',
  description: 'From checklists to city-specific suggestions, RelocateWise helps you move with confidence. Whether it\'s across town or across the world, we\'ve got you covered.',
  keywords: ['relocation', 'moving', 'checklist', 'planning', 'city guide', 'travel'],
  authors: [{ name: 'RelocateWise Team' }],
  openGraph: {
    title: 'RelocateWise - Plan Your Perfect Relocation',
    description: 'From checklists to city-specific suggestions, RelocateWise helps you move with confidence.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}