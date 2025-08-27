import type { Metadata } from "next";
import { Inter_Tight } from 'next/font/google'
import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ReduxProvider from '@/components/providers/redux-provider';
import '../globals.css';
import { HomeLayout } from "@/components/layout/HomeLayout";

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
})


export const metadata: Metadata = {
  title: "Shelfie",
  description: "Track your reading journey",
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
    <html lang={locale} className={interTight.variable}>
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
