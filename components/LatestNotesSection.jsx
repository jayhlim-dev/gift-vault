'use client';

import { NoteCard } from 'components/persons/NoteCard';
import { toDate } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';

function formatPersonName(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
        return '';
    }
    return trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function LatestNotesSection() {
    const { data: notes, isLoading: notesLoading } = useFirebaseCollection('notes');
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const isLoading = notesLoading || personsLoading;

    if (isLoading) {
        return (
            <section className="w-full pb-2">
                <header className="mb-3">
                    <h4 className="leading-tight font-semibold text-neutral-800">Latest Notes</h4>
                </header>
                <ul className="flex flex-col gap-2">
                    {[0, 1].map((key) => (
                        <li
                            key={key}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                        >
                            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-neutral-200" />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-200" />
                                <div className="h-2.5 w-40 max-w-full animate-pulse rounded-full bg-neutral-200" />
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        );
    }

    const personById = new Map(persons.map((person) => [person.id, person]));

    const latestNotes = notes
        .slice()
        .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))
        .slice(0, 2);

    if (!latestNotes.length) {
        return null;
    }

    return (
        <section className="w-full pb-2">
            <header className="mb-3 flex items-end justify-between gap-3">
                <div>
                    <h4 className="leading-tight font-semibold text-neutral-800">Latest Notes</h4>
                    <p className="mt-0.5 text-2xs text-neutral-400">{notes.length} notes saved</p>
                </div>
                {notes.length > 2 ? (
                    <Link
                        href="/notes"
                        className="text-xs font-semibold text-[#D4625A] no-underline transition hover:text-[#c4564f]"
                    >
                        See all
                    </Link>
                ) : null}
            </header>

            <ul className="flex flex-col gap-2">
                {latestNotes.map((note) => {
                    const person = note.personId ? personById.get(note.personId) : null;
                    const personName = formatPersonName(person?.name);

                    return (
                        <NoteCard
                            key={note.id}
                            note={note}
                            href={note.personId ? `/persons/${note.personId}?tab=notes` : undefined}
                            personName={personName || undefined}
                            personAvatarSrc={person?.avatarURL}
                            personAvatarInitial={person?.name?.charAt(0)?.toUpperCase()}
                            className="animate-fade-in"
                        />
                    );
                })}
            </ul>
        </section>
    );
}
