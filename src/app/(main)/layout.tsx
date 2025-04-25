'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';

import { useRouter } from 'next/navigation';

import Sidebar from '@/components/layout/sidebar';
import LoadingSpinner from '@/components/loading-spinner';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const isLoading = status === 'loading';
    const isAuthenticated = status === 'authenticated';

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log('ProtectedLayout: Not authenticated, redirecting to /login');
            router.replace('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="flex min-h-screen w-full bg-muted/40">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <div className="pt-6">{children}</div>
                    </main>
                </div>
            </div>
        );
    }

    return null;
}
