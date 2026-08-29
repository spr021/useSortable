import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const siteUrl = new URL('https://use-sortable-sort-lab.saber021.chatgpt.site');
const title = 'Sort Lab — use-sortable showcase';
const description =
  'An interactive showcase for sorting, filtering, and bookmarking React data with use-sortable.';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title,
    description,
    images: [
      {
        url: new URL('/og.png', siteUrl),
        width: 1729,
        height: 910,
        alt: 'Sort Lab — sort, filter, and pin React data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [new URL('/og.png', siteUrl)],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
