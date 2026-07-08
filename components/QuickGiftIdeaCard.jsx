const iconToneStyles = {
    pink: 'bg-[#FDEBEA] text-rose-400',
    blue: 'bg-[#EAF2FF] text-blue-400',
    amber: 'bg-[#FFF5E5] text-amber-500',
    rose: 'bg-[#FDEBEA] text-rose-400'
};

export function QuickGiftIdeaCard({ label, icon, count, tone = 'pink', className = '' }) {
    const iconToneClass = iconToneStyles[tone] || iconToneStyles.pink;

    function renderIcon() {
        if (icon === 'bag') {
            return (
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                    <path
                        d="M5.5 9h13l-1 9.5a2 2 0 01-2 1.5h-7a2 2 0 01-2-1.5L5.5 9z"
                        fill="currentColor"
                        opacity="0.9"
                    />
                    <path
                        d="M8.2 9V7.6a3.8 3.8 0 017.6 0V9"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            );
        }

        if (icon === 'plane') {
            return (
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                    <path
                        d="M21 11.3a1 1 0 00-1.2-.8l-5.9 1.4-2.5-6a1.2 1.2 0 00-2.2.1l-.3 6.8-3.8.9a1 1 0 00-.2 1.9l3.3 1.5 1.4 3.1a1 1 0 001.9-.2l.8-3.8 6.9-.3a1.2 1.2 0 00.1-2.2l-6-2.5 1.4-5.9a1 1 0 00-.8-1.2z"
                        fill="currentColor"
                    />
                </svg>
            );
        }

        if (icon === 'note') {
            return (
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                    <rect x="5" y="3.5" width="14" height="17" rx="2.2" fill="currentColor" opacity="0.88" />
                    <path d="M8 8h8M8 11.2h8M8 14.4h6" stroke="#fff8" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            );
        }

        if (icon === 'person') {
            return (
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" fill="none" />
                    <path
                        d="M5.5 18.7a6.5 6.5 0 0113 0"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                    />
                </svg>
            );
        }

        if (icon === 'people') {
            return (
                <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
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
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                <path
                    d="M12 20.5c-.3 0-.6-.1-.8-.3l-6-5.7A4.9 4.9 0 014 7.4 5.2 5.2 0 019.1 6c1.2 0 2.3.5 2.9 1.3A4 4 0 0114.9 6 5.2 5.2 0 0120 7.4c1.3 2 1 4.8-1.2 7l-6 5.8c-.2.2-.5.3-.8.3z"
                    fill="currentColor"
                />
            </svg>
        );
    }

    return (
        <article className={`flex w-full flex-col items-center justify-center gap-1.5 ${className}`}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconToneClass}`}>
                {renderIcon()}
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
                <p className="text-center text-sm leading-tight font-bold text-gray-700">{count}</p>
                <p className="text-center text-xs leading-tight text-gray-700">{label}</p>
            </div>
        </article>
    );
}
