import { NOTE_TAG_ACTIVE_CLASS } from 'lib/note-tags';

export function NoteTagChip({ label, className = '' }) {
    if (!label) {
        return null;
    }

    return (
        <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-2xs font-semibold ${NOTE_TAG_ACTIVE_CLASS} ${className}`}
        >
            {label}
        </span>
    );
}

export function NotePinnedChip({ className = '' }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-[#E8D4B0] bg-[#FFF8EE] px-2.5 py-0.5 text-2xs font-semibold text-[#B07A2A] ${className}`}
        >
            <PinIcon size={10} />
            Pinned
        </span>
    );
}

function PinIcon({ size = 10 }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
            <path
                d="M14 4l6 6-5 5-3-1-4 4-2-2 4-4-1-3 5-5z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinejoin="round"
            />
        </svg>
    );
}
