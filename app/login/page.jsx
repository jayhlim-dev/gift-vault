'use client';

import { useAuth } from 'lib/auth/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import GiftIll from 'public/images/assets/gift-ill.png';
import MemntoLogo from 'public/memnto-logo.png';

function GoogleIcon() {
    return (
        <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
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
            <div className="flex min-h-[100dvh] w-full items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#D4625A]/40 border-t-[#D4625A]" />
            </div>
        );
    }

    return (
        <div className="relative -mx-6 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden sm:-mx-12">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_0%,#FFD5C8_0%,#FDF5F1_48%,#F4E8E1_100%)]"
            />
            <div
                aria-hidden="true"
                className="animate-login-orb pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#F2A090]/55 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="animate-login-orb-delayed pointer-events-none absolute -right-20 top-28 h-80 w-80 rounded-full bg-[#E8B892]/50 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="animate-login-pulse pointer-events-none absolute bottom-8 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D4625A]/16 blur-3xl"
            />

            <div className="relative z-10 mx-auto flex w-full max-w-sm flex-1 flex-col px-6 pb-8 pt-11 sm:px-8">
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <Image
                        src={MemntoLogo}
                        alt="Memnto"
                        className="animate-login-rise h-auto w-40 object-contain"
                        priority
                        style={{ animationDelay: '40ms' }}
                    />

                    <div className="animate-login-rise relative mt-5" style={{ animationDelay: '120ms' }}>
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-0 top-8 -z-10 h-32 rounded-full bg-[#D4625A]/20 blur-2xl"
                        />
                        <div className="animate-login-float">
                            <Image
                                src={GiftIll}
                                alt=""
                                className="mx-auto h-[8.75rem] w-auto object-contain drop-shadow-[0_18px_32px_rgba(212,98,90,0.2)]"
                                aria-hidden="true"
                                priority
                            />
                        </div>
                    </div>

                    <div className="animate-login-rise mt-6" style={{ animationDelay: '200ms' }}>
                        <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-[#D4625A] uppercase">
                            Made for thoughtful giving
                        </p>
                        <h1 className="mt-2.5 font-[family-name:var(--font-display)] text-[2rem] leading-[1.15] font-normal tracking-tight text-[#2A2220]">
                            Know them
                            <span className="block italic text-[#D4625A]">by heart</span>
                        </h1>
                        <p className="mx-auto mt-3 max-w-[16.5rem] text-sm leading-relaxed text-[#7A6A65]">
                            Save the little details — birthdays, notes, and gift ideas — so every moment feels personal.
                        </p>
                    </div>

                    <div
                        className="animate-login-rise mt-8 flex w-full flex-col items-center"
                        style={{ animationDelay: '360ms' }}
                    >
                        <button
                            type="button"
                            onClick={handleSignIn}
                            disabled={isSigningIn}
                            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#D4625A] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(212,98,90,0.35)] transition hover:-translate-y-0.5 hover:bg-[#c4564f] hover:shadow-[0_14px_32px_rgba(212,98,90,0.4)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition group-hover:scale-105">
                                <GoogleIcon />
                            </span>
                            {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                        </button>

                        {error ? (
                            <p className="mt-3 text-xs font-medium text-[#D4625A]" role="alert">
                                {error}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="animate-login-rise shrink-0 space-y-3" style={{ animationDelay: '440ms' }}>
                    <p className="mx-auto hidden max-w-xs rounded-full border border-[#E8D4CC] bg-white/55 px-4 py-2 text-center text-[0.72rem] leading-snug text-[#7A6A65] backdrop-blur-sm md:block">
                        Memnto is designed for mobile — open this on your phone for the best experience
                    </p>
                    <p className="text-center text-[0.68rem] tracking-[0.06em] text-[#9A8A84]">
                        Private to you · Syncs across devices
                    </p>
                </div>
            </div>
        </div>
    );
}
