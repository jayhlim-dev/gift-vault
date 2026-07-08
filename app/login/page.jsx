'use client';

import { useAuth } from 'lib/auth/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import GFLogo from 'public/gift-vault-secondary-logo.png';

function GoogleIcon() {
    return (
        <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
            <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
            />
            <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.8 36.2 44 30.6 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
        </svg>
    );
}

export default function LoginPage() {
    const { user, isAuthLoading, signInWithGoogle } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthLoading && user) {
            router.replace('/');
        }
    }, [isAuthLoading, user, router]);

    async function handleSignIn() {
        setError('');
        setIsSigningIn(true);
        try {
            await signInWithGoogle();
            router.replace('/');
        } catch (err) {
            console.error('[login] Google sign-in failed:', err);
            setError('Failed to sign in. Please try again.');
        } finally {
            setIsSigningIn(false);
        }
    }

    if (isAuthLoading || user) {
        return (
            <div className="flex min-h-[70vh] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-300 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] w-full flex-col items-center justify-center gap-8 px-4 text-center">
            <Image src={GFLogo} alt="Gift Vault logo" className="h-auto w-36 object-contain" priority />

            <div className="flex w-full max-w-xs flex-col gap-2">
                <h1 className="text-xl font-bold text-neutral-800">Welcome to Gift Vault</h1>
                <p className="text-sm text-neutral-500">
                    Sign in to save people, track birthdays, and keep your gift ideas in one place.
                </p>
            </div>

            <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex w-full max-w-xs items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <GoogleIcon />
                {isSigningIn ? 'Signing in…' : 'Continue with Google'}
            </button>

            {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
        </div>
    );
}
