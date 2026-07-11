import Link from 'next/link';

export function UpcomingCard({ icon = '🎂', label, dateText, dueText, href, className = '' }) {
    const card = (
        <article className={`relative w-full ${className}`}>
            <div className="relative z-10 flex h-20 items-center justify-between rounded-2xl bg-white px-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEBEA] text-xl">
                        {icon}
                    </div>
                    <div className="min-w-0 flex flex-col gap-1">
                        <p className="truncate text-base leading-tight font-semibold text-neutral-800">{label}</p>
                        <p className="truncate text-xs text-neutral-500">{dateText}</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <span className="ml-3 shrink-0 rounded-full bg-[#FDEBEA] px-3 py-1 text-xs font-semibold text-rose-400">
                        {dueText}
                    </span>

                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        aria-hidden="true"
                        className="shrink-0 text-gray-500"
                    >
                        <path
                            d="M9 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </article>
    );

    if (href) {
        return (
            <Link href={href} className="block no-underline transition hover:opacity-90">
                {card}
            </Link>
        );
    }

    return card;
}

export function BdayCard({ label, dateText, dueText, stackCount = 1, className = '' }) {
    return (
        <UpcomingCard
            icon="🎂"
            label={label}
            dateText={dateText}
            dueText={dueText}
            className={className}
        />
    );
}
