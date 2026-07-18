'use client';

import { NoteCard } from 'components/persons/NoteCard';
import { PersonIcon } from 'components/persons/PersonIcons';
import { SearchBar } from 'components/SearchBar';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import { hasSearchQuery, searchNotes, searchPersons } from 'lib/search-utils';
import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';

function PersonResultRow({ person }) {
    return (
        <li>
            <Link
                href={`/persons/${person.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 no-underline shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:bg-[#FFFCFB]"
            >
                {person.avatarURL ? (
                    <img
                        src={person.avatarURL}
                        alt={person.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ECE8E6] text-neutral-400">
                        <PersonIcon size={18} />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800">{person.name || 'Unnamed'}</p>
                    {person.relationship ? (
                        <p className="truncate text-2xs capitalize text-neutral-500">{person.relationship}</p>
                    ) : (
                        <p className="truncate text-2xs text-neutral-400">Saved person</p>
                    )}
                </div>
            </Link>
        </li>
    );
}

function SearchResults({ query, persons, notes, isLoading }) {
    const deferredQuery = useDeferredValue(query);
    const matchedPeople = useMemo(() => searchPersons(persons, deferredQuery), [persons, deferredQuery]);
    const matchedNotes = useMemo(() => searchNotes(notes, deferredQuery), [notes, deferredQuery]);
    const personById = useMemo(() => new Map(persons.map((person) => [person.id, person])), [persons]);
    const total = matchedPeople.length + matchedNotes.length;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <div className="h-16 animate-pulse rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
                <div className="h-16 animate-pulse rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]" />
            </div>
        );
    }

    if (!total) {
        return (
            <div className="rounded-3xl border border-dashed border-[#E8D9D2] bg-white px-6 py-10 text-center">
                <p className="text-sm font-semibold text-neutral-800">No matches for “{query.trim()}”</p>
                <p className="mt-1 text-xs text-neutral-400">Try another name, note title, or keyword.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-2">
            {matchedPeople.length ? (
                <section>
                    <header className="mb-3 flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-neutral-800">People</h4>
                        <span className="rounded-full bg-[#FAF8F7] px-2 py-0.5 text-3xs font-semibold text-neutral-500">
                            {matchedPeople.length}
                        </span>
                    </header>
                    <ul className="flex flex-col gap-2">
                        {matchedPeople.map((person) => (
                            <PersonResultRow key={person.id} person={person} />
                        ))}
                    </ul>
                </section>
            ) : null}

            {matchedNotes.length ? (
                <section>
                    <header className="mb-3 flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-neutral-800">Notes</h4>
                        <span className="rounded-full bg-[#FAF8F7] px-2 py-0.5 text-3xs font-semibold text-neutral-500">
                            {matchedNotes.length}
                        </span>
                    </header>
                    <ul className="flex flex-col gap-2">
                        {matchedNotes.map((note) => {
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
                </section>
            ) : null}
        </div>
    );
}

export function HomeSearchSection({ onQueryChange }) {
    const [query, setQuery] = useState('');
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: notes, isLoading: notesLoading } = useFirebaseCollection('notes');
    const isLoading = personsLoading || notesLoading;
    const isSearching = hasSearchQuery(query);

    function handleChange(nextValue) {
        setQuery(nextValue);
        onQueryChange?.(nextValue);
    }

    return (
        <section className="flex w-full flex-col gap-5">
            <SearchBar
                value={query}
                onChange={handleChange}
                searchOnType
                placeholder="Search name or note..."
                className="w-full"
                showClear
            />

            {isSearching ? (
                <SearchResults query={query} persons={persons} notes={notes} isLoading={isLoading} />
            ) : null}
        </section>
    );
}
