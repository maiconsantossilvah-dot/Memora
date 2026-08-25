import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Memora — suas anotações, do seu jeito',
  description: 'Organize anotações, imagens, tags e compromissos em um espaço pessoal.',
  openGraph: {
    title: 'Memora',
    description: 'Suas ideias, organizadas do seu jeito.',
    type: 'website',
    locale: 'pt_BR',
    images: [{ url: '/og.png', width: 1664, height: 936, alt: 'Memora — suas ideias, organizadas do seu jeito.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Memora',
    description: 'Suas ideias, organizadas do seu jeito.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
