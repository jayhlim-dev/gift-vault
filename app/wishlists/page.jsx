'use client';

import { WishlistCard } from 'components/persons/WishlistCard';
import { HeartIcon, PersonIcon } from 'components/persons/PersonIcons';
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

function WishlistPageHero({ itemCount, peopleCount, isLoading }) {
    return (
        <header className="overflow-hidden rounded-3xl border border-[#F0E8E5] bg-linear-to-br from-white via-[#FFFCFB] to-[#FDEBEA]/70 px-5 py-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDEBEA] text-[#D4625A] shadow-[0_4px_14px_rgba(212,98,90,0.12)]">
                    <HeartIcon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-2xs font-semibold tracking-[0.12em] text-[#D4625A] uppercase">Gift ideas</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">Wishlist</h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                        Things they&apos;d love to receive — saved across everyone you care about.
                    </p>
                </div>
            </div>

            {!isLoading ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-2xs font-semibold text-neutral-600 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <HeartIcon size={12} />
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-2xs font-semibold text-neutral-600 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
                        <PersonIcon size={12} />
                        {peopleCount} {peopleCount === 1 ? 'person' : 'people'}
                    </span>
                </div>
            ) : (
                <div className="mt-4 flex gap-2">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-white/80" />
                    <div className="h-7 w-24 animate-pulse rounded-full bg-white/80" />
                </div>
            )}
        </header>
    );
}

function WishlistEmptyState({ hasPeople }) {
    return (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <Image src={WishlistEmptyImage} alt="" className="h-36 w-auto object-contain" aria-hidden="true" />
            <h2 className="mt-5 text-base font-bold text-neutral-900">Start collecting gift ideas</h2>
            <p className="mt-2 max-w-68 text-sm leading-relaxed text-neutral-500">
                {hasPeople
                    ? "Open someone's profile, go to Wishlist, and add the first item you'd love to remember."
                    : 'Add someone you buy gifts for, then save products and ideas on their wishlist.'}
            </p>

            <div className="mt-6 flex w-full flex-col gap-2.5">
                {hasPeople ? (
                    <Link
                        href="/persons"
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#D4625A] px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f]"
                    >
                        Browse people
                    </Link>
                ) : (
                    <Link
                        href="/persons/new"
                        className="inline-flex w-full items-center justify-center rounded-full bg-[#D4625A] px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f]"
                    >
                        Add your first person
                    </Link>
                )}
                {hasPeople ? (
                    <p className="text-2xs text-neutral-400">Tip: wishlist items appear here for everyone at once.</p>
                ) : (
                    <Link href="/persons" className="text-sm font-semibold text-[#D4625A] no-underline">
                        Or browse people
                    </Link>
                )}
            </div>
        </div>
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
    const peopleWithWishlists = filterPeople.length;

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-5 pb-28 text-neutral-900">
            <WishlistPageHero
                itemCount={sortedWishlists.length}
                peopleCount={peopleWithWishlists}
                isLoading={isLoading}
            />

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
                                    <WishlistCard
                                        key={item.id}
                                        item={item}
                                        personName={person?.name}
                                        href={`/persons/${item.personId}?tab=wishlist`}
                                    />
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                            <p className="text-sm font-semibold text-neutral-800">No wishlist items for this person.</p>
                            <p className="mt-1 text-xs text-neutral-400">
                                Try another filter or add items on their profile.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <WishlistEmptyState hasPeople={persons.length > 0} />
            )}
        </div>
    );
}
