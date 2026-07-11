'use client';

import { LatestNoteCard } from 'components/LatestNoteCard';
import { formatRelativeTime, toDate } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';

export function LatestNotesSection() {
    const { data: notes, isLoading: notesLoading } = useFirebaseCollection('notes');
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const isLoading = notesLoading || personsLoading;

    if (isLoading) {
        return (
            <section className="w-full pb-2">
                <header className="mb-4 flex items-start justify-between gap-3">
                    <h4 className="leading-tight text-gray-800 font-semibold">Latest Notes</h4>
                </header>
                <div className="flex flex-col gap-4">
                    {[0, 1].map((key) => (
                        <div
                            key={key}
                            className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                        >
                            <div className="h-13 w-13 shrink-0 animate-pulse rounded-full bg-neutral-200" />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-200" />
                                <div className="h-2.5 w-40 max-w-full animate-pulse rounded-full bg-neutral-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    const personById = new Map(persons.map((person) => [person.id, person]));

    const latestNotes = notes
        .slice()
        .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
        .slice(0, 2)
        .map((note) => {
            const person = note.personId ? personById.get(note.personId) : null;

            return {
                id: note.id,
                personId: note.personId || null,
                name: person?.name || note.category || 'Note',
                note: note.text,
                timeAgo: formatRelativeTime(note.createdAt),
                avatarSrc: person?.avatarURL || undefined
            };
        });

    if (!latestNotes.length) {
        return null;
    }

    return (
        <section className="w-full pb-2">
            <header className="mb-4 flex items-start justify-between gap-3">
                <h4 className="leading-tight text-gray-800 font-semibold">Latest Notes</h4>

                <button
                    type="button"
                    className="pt-0.5 text-right text-xs leading-tight font-semibold text-rose-400 no-underline transition hover:text-rose-400 "
                >
                    See all
                </button>
            </header>

            <div className="flex flex-col gap-4">
                {latestNotes.map((note) => (
                    <LatestNoteCard
                        key={note.id}
                        href={note.personId ? `/persons/${note.personId}` : undefined}
                        name={note.name}
                        note={note.note}
                        timeAgo={note.timeAgo}
                        avatarSrc={note.avatarSrc}
                        showAction
                        className="animate-fade-in"
                    />
                ))}
            </div>
        </section>
    );
}
