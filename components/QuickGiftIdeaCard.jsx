'use client';

import Link from 'next/link';

const iconToneStyles = {
    pink: 'bg-[#FDEBEA] text-[#D4625A]',
    blue: 'bg-[#EAF2FF] text-[#4A7FA5]',
    amber: 'bg-[#FFF5E5] text-amber-500',
    rose: 'bg-[#FDEBEA] text-[#D4625A]'
};

export function QuickGiftIdeaCard({ label, icon, count, tone = 'pink', href, className = '' }) {
    const iconToneClass = iconToneStyles[tone] || iconToneStyles.pink;

    function renderIcon() {
        if (icon === 'calendar') {
            return (
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <rect x="4" y="5.5" width="16" height="14" rx="2.2" fill="currentColor" opacity="0.9" />
                    <path d="M8 4v3.5M16 4v3.5" stroke="#fff8" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M4 10h16" stroke="#fff8" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="9" cy="14.2" r="1.1" fill="#fff8" />
                    <circle cx="12.5" cy="14.2" r="1.1" fill="#fff8" />
                    <circle cx="16" cy="14.2" r="1.1" fill="#fff8" />
                </svg>
            );
        }

        if (icon === 'note') {
            return (
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <rect x="5" y="3.5" width="14" height="17" rx="2.2" fill="currentColor" opacity="0.88" />
                    <path d="M8 8h8M8 11.2h8M8 14.4h6" stroke="#fff8" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            );
        }

        if (icon === 'people') {
            return (
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                    <circle cx="9.5" cy="8.3" r="2.9" stroke="currentColor" strokeWidth="1.7" fill="none" />
                    <path
                        d="M4.3 18.3a5.2 5.2 0 0110.4 0"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <circle cx="16.3" cy="9" r="2.1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path
                        d="M13.6 18.3a4 4 0 017.4-2.1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            );
        }

        return (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                    d="M12 20.5c-.3 0-.6-.1-.8-.3l-6-5.7A4.9 4.9 0 014 7.4 5.2 5.2 0 019.1 6c1.2 0 2.3.5 2.9 1.3A4 4 0 0114.9 6 5.2 5.2 0 0120 7.4c1.3 2 1 4.8-1.2 7l-6 5.8c-.2.2-.5.3-.8.3z"
                    fill="currentColor"
                />
            </svg>
        );
    }

    const content = (
        <>
            <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition group-hover:scale-[1.04] ${iconToneClass}`}
            >
                {renderIcon()}
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5">
                <p className="text-center text-base leading-none font-bold text-neutral-800">{count}</p>
                <p className="text-center text-2xs leading-tight font-medium text-neutral-500">{label}</p>
            </div>
        </>
    );

    const sharedClass = `group flex w-full flex-col items-center justify-center gap-2 rounded-2xl px-1 py-2 transition ${className}`;

    if (href) {
        return (
            <Link href={href} className={`${sharedClass} no-underline hover:bg-[#FAF8F7]`}>
                {content}
            </Link>
        );
    }

    return <article className={sharedClass}>{content}</article>;
}
