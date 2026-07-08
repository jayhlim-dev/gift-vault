export function BdayCard({ label, dateText, dueText, stackCount = 1, className = '' }) {
    const showStack = stackCount > 1;

    return (
        <article className={`relative w-full ${showStack ? 'pt-0.5' : ''} ${className}`}>
            {/* {showThirdLayer ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-2 top-0 h-20 rounded-2xl border border-[#F6EDEA] bg-[#FFF7F4]"
                />
            ) : null} */}

            {/* {showStack ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-1 -top-0.5 h-20 rounded-2xl border border-[#F3E6E2] bg-white"
                />
            ) : null} */}

            <div className="relative z-10 flex h-20 items-center justify-between rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white px-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDEBEA] text-xl">
                        🎂
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
}
