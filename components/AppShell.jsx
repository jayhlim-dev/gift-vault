'use client';

import { AuthGuard } from 'components/auth/AuthGuard';
import { AuthProvider } from 'lib/auth/AuthContext';
import { usePathname } from 'next/navigation';
import { Footer } from './footer';
import { Header } from './header';

const CHROME_HIDDEN_PATHS = ['/login'];

/*
Wraps the whole app with auth context + route protection, and hides the app
chrome (header/footer nav) on standalone pages like /login.
*/
export function AppShell({ children }) {
    const pathname = usePathname();
    const hideChrome = CHROME_HIDDEN_PATHS.includes(pathname);

    return (
        <AuthProvider>
            <div className="flex flex-col w-full max-w-5xl mx-auto grow">
                <AuthGuard>
                    {!hideChrome ? <Header /> : null}
                    <main className={hideChrome ? 'flex grow flex-col' : 'grow pb-28'}>{children}</main>
                    {!hideChrome ? <Footer /> : null}
                </AuthGuard>
            </div>
        </AuthProvider>
    );
}
