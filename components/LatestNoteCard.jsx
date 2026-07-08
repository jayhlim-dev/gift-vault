export function LatestNoteCard({ name, note, timeAgo, avatarSrc, showAction = true, className = '' }) {
    return (
        <article
            className={`relative flex items-center justify-between rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white px-4 py-3 gap-1 w-full ${className}`}
        >
            <div className="flex min-w-0 items-center gap-3 w-full">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={`${name} avatar`}
                        className="h-13 w-13 shrink-0 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#E8D9D2] text-lg font-semibold text-neutral-700">
                        {name?.charAt(0) || '?'}
                    </div>
                )}

                <div className="min-w-0 w-full">
                    <div className="flex items-center justify-between gap-2">
                        <p className="min-w-0 max-w-32 line-clamp-1 text-sm font-semibold text-neutral-900">{name}</p>

                        <div className="flex shrink-0 gap-2">
                            <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">{timeAgo}</span>
                        </div>
                    </div>
                    <p className="mt-1 line-clamp-2 max-w-52 text-2xs leading-5 text-neutral-600">{note}</p>
                </div>
            </div>

            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="shrink-0 text-neutral-300">
                <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </article>
    );
}
