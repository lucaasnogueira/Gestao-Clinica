import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/shared/providers';

export const metadata: Metadata = {
  title: { default: 'ClinicaOS', template: '%s | ClinicaOS' },
  description: 'Sistema de Gerenciamento de Clínicas — NestJS + Next.js',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </Providers>
      </body>
    </html>
  );
}
