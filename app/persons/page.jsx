'use client';

import { ProductCard } from 'components/ProductCard';
import { SearchBar } from 'components/SearchBar';
import { FriendsIcon, PersonIcon } from 'components/persons/PersonIcons';
import { getToneForRelationship } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';
import { useMemo, useState } from 'react';

function formatPersonName(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) {
        return 'Unnamed';
    }

    return trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
}

function PeoplePageHero({ peopleCount, isLoading }) {
    return (
        <header className="overflow-hidden rounded-3xl border border-[#F0E8E5] bg-linear-to-br from-white via-[#FFFCFB] to-[#FDEBEA]/70 px-5 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDEBEA] text-[#D4625A] shadow-[0_4px_14px_rgba(212,98,90,0.12)]">
                    <FriendsIcon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-2xs font-semibold tracking-[0.12em] text-[#D4625A] uppercase">Your circle</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Saved People</h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                        Everyone you&apos;re keeping notes, gift ideas, and reminders for.
                    </p>
                </div>
            </div>

            {!isLoading ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-2xs font-semibold text-neutral-600 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <PersonIcon size={12} />
                        {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
                    </span>
                </div>
            ) : (
                <div className="mt-4 flex gap-2">
                    <div className="h-7 w-24 animate-pulse rounded-full bg-white/80" />
                </div>
            )}
        </header>
    );
}

function PeopleEmptyState() {
    return (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FDEBEA] text-[#D4625A]">
                <FriendsIcon size={28} />
            </span>
            <h2 className="mt-5 text-base font-bold text-neutral-900">Add the people you gift for</h2>
            <p className="mt-2 max-w-68 text-sm leading-relaxed text-neutral-500">
                Save friends and family first. Then you can attach notes, wishlists, reminders, and connections.
            </p>
            <Link
                href="/persons/new"
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#D4625A] px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f]"
            >
                Add your first person
            </Link>
        </div>
    );
}

export default function PersonsPage() {
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const [query, setQuery] = useState('');

    const sortedPeople = useMemo(
        () => persons.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '')),
        [persons]
    );

    const filteredPeople = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return sortedPeople;
        }

        return sortedPeople.filter((person) => {
            const haystack = [person.name, person.relationship, person.bio].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(normalized);
        });
    }, [sortedPeople, query]);

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 pb-28 text-neutral-900">
            <PeoplePageHero peopleCount={persons.length} isLoading={isLoading} />

            {!isLoading && sortedPeople.length > 0 ? (
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    searchOnType
                    showClear
                    placeholder="Search people..."
                    className="w-full"
                />
            ) : null}

            {isLoading ? (
                <div className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex w-full max-w-[76px] flex-col items-center gap-1.5 justify-self-center"
                        >
                            <div className="h-16 w-16 animate-pulse rounded-full bg-neutral-200" />
                            <div className="h-3 w-10 animate-pulse rounded-full bg-neutral-200" />
                        </div>
                    ))}
                </div>
            ) : sortedPeople.length ? (
                filteredPeople.length ? (
                    <div className="grid grid-cols-4 gap-3">
                        {filteredPeople.map((person) => (
                            <ProductCard
                                key={person.id}
                                href={`/persons/${person.id}`}
                                label={formatPersonName(person.name)}
                                initial={person.name?.charAt(0)?.toUpperCase() || '?'}
                                avatarSrc={person.avatarURL || undefined}
                                tone={getToneForRelationship(person.relationship)}
                                className="animate-fade-in justify-self-center"
                            />
                        ))}
                        {!query.trim() ? (
                            <ProductCard label="Add" isAdd href="/persons/new" className="justify-self-center" />
                        ) : null}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-[#E8D9D2] bg-white px-6 py-10 text-center">
                        <p className="text-sm font-semibold text-neutral-800">No matches for “{query.trim()}”</p>
                        <p className="mt-1 text-xs text-neutral-400">Try another name or clear the search.</p>
                    </div>
                )
            ) : (
                <PeopleEmptyState />
            )}
        </div>
    );
}
