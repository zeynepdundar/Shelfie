import type { Metadata } from "next";
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ReduxProvider from '@/components/providers/redux-provider';
import '../globals.css';
import { HomeLayout } from "@/components/layout/HomeLayout";


export const metadata: Metadata = {
  title: "Shelfie",
  description: "Track your reading journey",
  icons: {
    icon: "/logo-books.svg",
    shortcut: "/logo-books.svg",
    apple: "/logo-books.svg",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: { locale: 'en' | 'tr' };
}>) {
  const { locale } = await Promise.resolve(params as any);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <HomeLayout>{children}</HomeLayout>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );  
}
