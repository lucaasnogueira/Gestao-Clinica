import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { Providers } from '@/components/shared/providers';

export const metadata: Metadata = {
  title: { 
    default: 'Gestão Clínica — Portal Aurora', 
    template: '%s | Gestão Clínica' 
  },
  description: 'A plataforma premium para gestão de clínicas e consultórios. Agendamentos, prontuários eletrônicos e faturamento automatizado.',
  keywords: ['gestão clínica', 'prontuário eletrônico', 'agendamento médico', 'software para clínicas'],
  authors: [{ name: 'Lucas Nogueira' }],
  openGraph: {
    title: 'Gestão Clínica — Portal Aurora',
    description: 'Sistema completo para gestão de saúde com foco em UX e eficiência.',
    url: 'https://clinic-management.railway.app',
    siteName: 'Portal Aurora',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
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
