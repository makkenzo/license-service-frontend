'use client';

import React, { useState } from 'react';

import { signIn, useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import LoadingSpinner from '../loading-spinner';

export function LoginForm() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onSubmit = async () => {
        setIsLoading(true);
        try {
            await signIn('zitadel', { callbackUrl: '/dashboard' });
        } catch (error: any) {
            console.error('Login initiation failed:', error);
            toast.error('Failed to start login process.');
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (status === 'authenticated') {
            router.replace('/dashboard');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <Card className="w-full max-w-sm flex items-center justify-center p-6">
                <LoadingSpinner />
            </Card>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Click the button below to sign in using your organization's account (via Zitadel).
                    </CardDescription>
                </CardHeader>

                <CardFooter>
                    <Button onClick={onSubmit} className="w-full" disabled={isLoading}>
                        {isLoading ? 'Redirecting...' : 'Sign in with Zitadel'}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return null;
}
