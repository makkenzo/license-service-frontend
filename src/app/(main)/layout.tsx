'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Sidebar from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/auth-store';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const authenticated = useAuthStore.getState().isAuthenticated;
            if (!authenticated) {
                router.replace('/login');
            } else {
                setIsCheckingAuth(false);
            }
        };

        const persistedState = useAuthStore.persist
            .getOptions()
            .storage?.getItem(useAuthStore.persist.getOptions().name || '');
        if (!persistedState) {
            checkAuth();
        } else {
            const timer = setTimeout(() => {
                checkAuth();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [router]);

    if (isCheckingAuth && !isAuthenticated) {
        return <div className="flex min-h-screen items-center justify-center">Loading authentication...</div>;
    }

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
