import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const cacheBuster = `?v=${new Date().getTime()}`;
const iconUrl = `/icon.svg${cacheBuster}`;

export const metadata: Metadata = {
  metadataBase: new URL('https://shortened.link'),
  title: 'Shortened Link | Free & Simple URL Shortener',
  description: 'The easiest way to shorten, manage, and track your links. Create short, memorable, and branded links for free with our powerful and easy-to-use platform.',
  keywords: ['url shortener', 'link shortener', 'custom url', 'branded links', 'free url shortener', 'link management', 'short links'],
  openGraph: {
    title: 'Shortened Link | Free & Simple URL Shortener',
    description: 'The easiest way to shorten, manage, and track your links. Create short, memorable, and branded links for free.',
    url: 'https://shortened.link',
    siteName: 'Shortened Link',
    images: [
      {
        url: iconUrl,
        width: 1200,
        height: 630,
        alt: 'Shortened Link Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shortened Link | Free & Simple URL Shortener',
    description: 'The easiest way to shorten, manage, and track your links. Create short, memorable, and branded links for free.',
    images: [iconUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', inter.variable, poppins.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
