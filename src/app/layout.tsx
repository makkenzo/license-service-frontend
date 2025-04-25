import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';

import ReactQueryProvider from '@/components/providers/react-query-provider';
import NextAuthProvider from '@/components/providers/session-provider';
import { Toaster } from '@/components/ui/sonner';

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
    title: 'License Manager',
    description: 'Manage your software licenses',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NextAuthProvider>
                    <ReactQueryProvider>
                        {children} <Toaster richColors position="top-right" />
                    </ReactQueryProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}
