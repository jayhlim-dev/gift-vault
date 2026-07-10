'use client';

import { useRouter } from 'next/navigation';

export function BackButton({ fallbackHref = '/', className = '' }) {
    const router = useRouter();

    function handleClick() {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallbackHref);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="Go back"
            className={`flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100 ${className}`}
        >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                    d="M15 6l-6 6 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}
