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
