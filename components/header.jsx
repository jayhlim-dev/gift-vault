'use client';

import { useAuth } from 'lib/auth/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import GFLogo from 'public/gift-vault-secondary-logo.png';
import NotificationIcon from 'public/images/notification.png';
import { useEffect, useRef, useState } from 'react';

export function Header() {
    const { user, signOutUser } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function handleSignOut() {
        setIsMenuOpen(false);
        await signOutUser();
    }

    return (
        <nav className="flex items-center justify-between gap-3 pb-6 pt-8">
            <Link href="/">
                <Image src={GFLogo} alt="Gift Vault logo" className="h-auto w-28 object-contain " />
            </Link>

            <div className="flex items-center gap-2">
                <Link href="/">
                    <Image src={NotificationIcon} alt="Notifications" className="h-auto w-9 object-contain" />
                </Link>
                <Link
                    href="/"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FDEBEA] no-underline text-rose-400 font-bold text-lg pb-0.5"
                >
                    +
                </Link>

                {user ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            className="block h-10 w-10 overflow-hidden rounded-full border border-[#F2E9E6]"
                            aria-label="Account menu"
                        >
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName || 'Profile'} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#FDEBEA] text-sm font-semibold text-rose-400">
                                    {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
                                </div>
                            )}
                        </button>

                        {isMenuOpen ? (
                            <div className="absolute right-0 top-12 z-20 w-48 rounded-xl bg-white p-3 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
                                <p className="truncate text-xs font-semibold text-neutral-800">{user.displayName || 'Signed in'}</p>
                                <p className="truncate text-2xs text-neutral-500">{user.email}</p>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="mt-2 w-full rounded-lg bg-[#FDEBEA] px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </nav>
    );
}
