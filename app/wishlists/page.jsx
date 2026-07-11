'use client';

import { WishlistCard } from 'components/persons/WishlistCard';
import { toDate } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import WishlistEmptyImage from 'public/images/assets/gift-ill.png';
import { useEffect, useMemo, useState } from 'react';

function WishlistsPersonFilter({ activePersonId, onChange, people }) {
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

function WishlistListCard({ item, personName }) {
    return (
        <WishlistCard
            item={item}
            personName={personName}
            href={`/persons/${item.personId}?tab=wishlist`}
        />
    );
}

export default function WishlistsPage() {
    const { data: persons, isLoading: personsLoading } = useFirebaseCollection('persons');
    const { data: wishlists, isLoading: wishlistsLoading } = useFirebaseCollection('wishlists');
    const [activePersonId, setActivePersonId] = useState('all');
    const isLoading = personsLoading || wishlistsLoading;

    const personById = useMemo(() => new Map(persons.map((person) => [person.id, person])), [persons]);

    const sortedWishlists = useMemo(
        () =>
            wishlists
                .slice()
                .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0)),
        [wishlists]
    );

    const filterPeople = useMemo(() => {
        const usedPersonIds = new Set(sortedWishlists.map((item) => item.personId).filter(Boolean));
        return persons.filter((person) => usedPersonIds.has(person.id)).sort((a, b) => a.name.localeCompare(b.name));
    }, [persons, sortedWishlists]);

    const filteredItems = useMemo(() => {
        if (activePersonId === 'all') {
            return sortedWishlists;
        }

        return sortedWishlists.filter((item) => item.personId === activePersonId);
    }, [activePersonId, sortedWishlists]);

    useEffect(() => {
        if (activePersonId !== 'all' && !filterPeople.some((person) => person.id === activePersonId)) {
            setActivePersonId('all');
        }
    }, [activePersonId, filterPeople]);

    const showPersonFilter = !isLoading && sortedWishlists.length > 0 && filterPeople.length > 0;

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 pb-28 text-neutral-900">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-neutral-900">Wishlist</h1>
                <p className="text-sm text-neutral-500">Gift ideas and things they want, across everyone you save.</p>
            </header>

            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {[0, 1, 2].map((key) => (
                        <div
                            key={key}
                            className="h-20 animate-pulse rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                        />
                    ))}
                </div>
            ) : sortedWishlists.length ? (
                <div className="flex flex-col gap-3">
                    {showPersonFilter ? (
                        <WishlistsPersonFilter
                            activePersonId={activePersonId}
                            onChange={setActivePersonId}
                            people={filterPeople}
                        />
                    ) : null}

                    {filteredItems.length ? (
                        <ul className="flex flex-col gap-2">
                            {filteredItems.map((item) => {
                                const person = personById.get(item.personId);
                                return (
                                    <WishlistListCard
                                        key={item.id}
                                        item={item}
                                        personName={person?.name}
                                    />
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                            <p className="text-sm font-semibold text-neutral-800">No wishlist items for this person.</p>
                            <p className="mt-1 text-xs text-neutral-400">Try another filter or add items on their profile.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-8 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <Image src={WishlistEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                    <p className="text-sm font-semibold text-neutral-800">No wishlist items yet.</p>
                    <p className="text-xs text-neutral-400">
                        Open someone&apos;s profile and add things they&apos;d love to receive.
                    </p>
                    <Link href="/persons" className="mt-4 inline-block text-sm font-semibold text-[#D4625A] no-underline">
                        Browse people
                    </Link>
                </div>
            )}
        </div>
    );
}
