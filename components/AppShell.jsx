'use client';

import { AuthGuard } from 'components/auth/AuthGuard';
import { AuthProvider } from 'lib/auth/AuthContext';
import { LoadingProvider } from 'lib/LoadingContext';
import { usePathname } from 'next/navigation';
import { Footer } from './footer';
import { Header } from './header';

const CHROME_HIDDEN_EXACT_PATHS = ['/login'];
const HEADER_HIDDEN_PREFIXES = ['/persons/'];
const FOOTER_HIDDEN_EXACT_PATHS = ['/login', '/persons/new'];
const FOOTER_HIDDEN_SUFFIXES = ['/edit'];

function shouldHideFooter(pathname) {
    if (FOOTER_HIDDEN_EXACT_PATHS.includes(pathname)) {
        return true;
    }

    return FOOTER_HIDDEN_SUFFIXES.some((suffix) => pathname.endsWith(suffix));
}

/*
Wraps the whole app with auth context + route protection, and hides the app
chrome (header/footer nav) on standalone pages like /login and the person
add/edit flow, which manage their own back navigation.
*/
export function AppShell({ children }) {
    const pathname = usePathname();
    const isLogin = pathname === '/login';
    const hideHeader =
        CHROME_HIDDEN_EXACT_PATHS.includes(pathname) || HEADER_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    const hideFooter = shouldHideFooter(pathname);
    const showFooter = !hideFooter;

    return (
        <AuthProvider>
            <LoadingProvider>
                <div className={`flex w-full grow flex-col ${isLogin ? 'max-w-none' : 'mx-auto max-w-5xl'}`}>
                    <AuthGuard>
                        {!hideHeader ? <Header /> : null}
                        <main className={showFooter ? 'grow pb-28' : hideHeader ? 'flex grow flex-col' : 'grow pb-28'}>{children}</main>
                        {showFooter ? <Footer /> : null}
                    </AuthGuard>
                </div>
            </LoadingProvider>
        </AuthProvider>
    );
}
