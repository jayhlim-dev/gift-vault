'use client';

import { useAuth } from 'lib/auth/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_PATHS = ['/login'];

/*
Redirects signed-out visitors to /login for every page except the ones in PUBLIC_PATHS.
Shows a small spinner while the initial auth state is still resolving.
*/
export function AuthGuard({ children }) {
    const { user, isAuthLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }
        if (!user && !isPublicPath) {
            router.replace('/login');
        }
    }, [user, isAuthLoading, isPublicPath, router]);

    if (isAuthLoading) {
        return (
            <div className="flex min-h-[70vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-300 border-t-transparent" />
            </div>
        );
    }

    if (!user && !isPublicPath) {
        return null;
    }

    return children;
}
