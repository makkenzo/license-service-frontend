'use client';

import { KeySquare, LayoutDashboard, LogOut } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/licenses', label: 'Licenses', icon: KeySquare },
];

export default function Sidebar() {
    const pathname = usePathname();
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        toast.success('You have been logged out.');
        router.push('/login');
    };

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-border h-screen sticky top-0">
            <div className="flex items-center h-16 px-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <span>License Manager</span>
                </Link>
            </div>
            <nav className="flex-1 py-4 px-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-400 transition-all hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800',

                            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                                ? 'bg-gray-100 dark:bg-gray-800 text-primary dark:text-primary font-medium'
                                : ''
                        )}
                    >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                    </Link>
                ))}
            </nav>
            {/* Кнопка Logout внизу */}
            <div className="mt-auto p-4 border-t">
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
