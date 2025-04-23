'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/auth-store';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            if (!isAuthenticated) {
                console.log('User not authenticated, redirecting to login...');
                router.replace('/login');
            } else {
                setIsCheckingAuth(false);
            }
        };

        const timer = setTimeout(() => {
            checkAuth();
        }, 100);

        return () => clearTimeout(timer);
    }, [isAuthenticated, router]);

    if (isCheckingAuth && !isAuthenticated) {
        return <div className="flex min-h-screen items-center justify-center">Loading authentication...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
    );
}
