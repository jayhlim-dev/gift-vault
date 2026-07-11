import Link from 'next/link';

import { NoteTagChip } from 'components/persons/NoteTagChip';

export function LatestNoteCard({ name, note, timeAgo, tagLabel, avatarSrc, href, showAction = true, className = '' }) {
    const content = (
        <>
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
                    </div>
                    <p className="mt-1 line-clamp-2 max-w-52 text-2xs leading-5 text-neutral-600">{note}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <NoteTagChip label={tagLabel} />
                        {timeAgo ? <span className="text-2xs text-neutral-500">{timeAgo}</span> : null}
                    </div>
                </div>
            </div>

            {showAction ? (
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
            ) : null}
        </>
    );

    const cardClassName = `relative flex items-center justify-between rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] bg-white px-4 py-3 gap-1 w-full ${className}`;

    if (href) {
        return (
            <Link href={href} className={`${cardClassName} no-underline transition hover:bg-[#FFFCFB]`}>
                {content}
            </Link>
        );
    }

    return <article className={cardClassName}>{content}</article>;
}
