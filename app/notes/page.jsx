'use client';

import { NoteCard } from 'components/persons/NoteCard';
import { toDate } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import NotesEmptyImage from 'public/images/assets/note-ill.png';
import { useEffect, useMemo, useState } from 'react';

function NotesPersonFilter({ activePersonId, onChange, people }) {
    const options = [{ id: 'all', label: 'All' }, ...people.map((person) => ({ id: person.id, label: person.name }))];

    return (
        <div
            role="tablist"
            aria-label="Filter by person"
            className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)] scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {options.map((option) => {
                const isActive = activePersonId === option.id;
                return (
                    <button
                        key={option.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(option.id)}
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition ${
                            isActive
                                ? 'bg-[#D4625A] text-white shadow-[0_4px_14px_rgba(212,98,90,0.24)]'
                                : 'text-neutral-500 hover:text-neutral-700'
                        }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

export default function NotesPage() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: notes, isLoading: notesLoading } = useFirebaseCollection('notes');
    const [activePersonId, setActivePersonId] = useState('all');
    const isLoading = personsLoading || notesLoading;

    const personById = useMemo(() => new Map(persons.map((person) => [person.id, person])), [persons]);

    const sortedNotes = useMemo(
        () =>
            notes
                .slice()
                .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0)),
        [notes]
    );

    const filterPeople = useMemo(() => {
        const usedPersonIds = new Set(sortedNotes.map((note) => note.personId).filter(Boolean));
        return persons.filter((person) => usedPersonIds.has(person.id)).sort((a, b) => a.name.localeCompare(b.name));
    }, [persons, sortedNotes]);

    const filteredNotes = useMemo(() => {
        if (activePersonId === 'all') {
            return sortedNotes;
        }

        return sortedNotes.filter((note) => note.personId === activePersonId);
    }, [activePersonId, sortedNotes]);

    useEffect(() => {
        if (activePersonId !== 'all' && !filterPeople.some((person) => person.id === activePersonId)) {
            setActivePersonId('all');
        }
    }, [activePersonId, filterPeople]);

    const showPersonFilter = !isLoading && sortedNotes.length > 0 && filterPeople.length > 0;

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 pb-28 text-neutral-900">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-neutral-900">Notes</h1>
                <p className="text-sm text-neutral-500">Things you&apos;ve jotted down about the people you save.</p>
            </header>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[0, 1, 2].map((key) => (
                        <div
                            key={key}
                            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                        >
                            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-neutral-200" />
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                                <div className="h-3 w-24 animate-pulse rounded-full bg-neutral-200" />
                                <div className="h-2.5 w-40 max-w-full animate-pulse rounded-full bg-neutral-200" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : sortedNotes.length ? (
                <div className="flex flex-col gap-3">
                    {showPersonFilter ? (
                        <NotesPersonFilter
                            activePersonId={activePersonId}
                            onChange={setActivePersonId}
                            people={filterPeople}
                        />
                    ) : null}

                    {filteredNotes.length ? (
                        <ul className="flex flex-col gap-2">
                            {filteredNotes.map((note) => {
                                const person = note.personId ? personById.get(note.personId) : null;

                                return (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        href={note.personId ? `/persons/${note.personId}?tab=notes` : undefined}
                                        personName={person?.name}
                                        personAvatarSrc={person?.avatarURL}
                                        personAvatarInitial={person?.name?.charAt(0)?.toUpperCase()}
                                    />
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                            <p className="text-sm font-semibold text-neutral-800">No notes for this person.</p>
                            <p className="mt-1 text-xs text-neutral-400">Try another filter or add notes on their profile.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-8 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <Image src={NotesEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                    <p className="text-sm font-semibold text-neutral-800">No notes yet.</p>
                    <p className="text-xs text-neutral-400">
                        Open someone&apos;s profile and jot down gift ideas, preferences, and little details.
                    </p>
                    <Link href="/persons" className="mt-4 inline-block text-sm font-semibold text-[#D4625A] no-underline">
                        Browse people
                    </Link>
                </div>
            )}
        </div>
    );
}
