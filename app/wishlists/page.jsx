'use client';

import { WishlistIcon } from 'components/persons/WishlistIcons';
import { formatIdrDisplay, formatRelativeTime, toDate } from 'lib/gift-vault-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import WishlistEmptyImage from 'public/images/assets/gift-ill.png';
import { useEffect, useMemo, useState } from 'react';

const WISHLIST_CATEGORY_LABELS = {
    want: 'Want',
    need: 'Need',
    hobby: 'Hobby',
    gift: 'Gift'
};

function getWishlistSubtitle(item) {
    const parts = [];

    if (item.price) {
        parts.push(formatIdrDisplay(item.price));
    }

    const categoryLabel = WISHLIST_CATEGORY_LABELS[item.category] || item.category;
    if (categoryLabel) {
        parts.push(categoryLabel);
    }

    const time = formatRelativeTime(item.createdAt);
    if (time) {
        parts.push(time);
    }

    return parts.join(' · ');
}

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
        <Link
            href={`/persons/${item.personId}?tab=wishlist`}
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 no-underline shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition hover:bg-[#FFFCFB]"
        >
            {item.imageURL ? (
                <img src={item.imageURL} alt={item.title} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
            ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEA] text-[#D4625A]">
                    <WishlistIcon id={item.iconId || 'gift'} size={20} />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-800">{item.title}</p>
                <p className="mt-0.5 truncate text-2xs text-neutral-500">{getWishlistSubtitle(item)}</p>
                {personName ? <p className="mt-1 text-2xs font-medium text-[#D4625A]">{personName}</p> : null}
            </div>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="shrink-0 text-neutral-300">
                <path
                    d="M9 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </Link>
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
                                    <li key={item.id}>
                                        <WishlistListCard item={item} personName={person?.name} />
                                    </li>
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
