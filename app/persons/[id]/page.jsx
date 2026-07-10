'use client';

import { BackButton } from 'components/BackButton';
import { NotebookIcon, PersonIcon } from 'components/persons/PersonIcons';
import { PersonNotesTab } from 'components/persons/PersonNotesTab';
import { PersonWishlistTab } from 'components/persons/PersonWishlistTab';
import { formatShortDate, getToneForRelationship, toDate } from 'lib/gift-vault-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TABS = [
    { id: 'notes', label: 'Notes' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'ideas', label: 'Gift Ideas' },
    { id: 'moments', label: 'Moments' }
];

const TONE_BADGE_ICON = {
    pink: '❤',
    amber: '★',
    blue: '●'
};

function MenuIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="5" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="19" r="1.6" fill="currentColor" />
        </svg>
    );
}

export default function PersonDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const { request } = useApiClient();
    const [activeTab, setActiveTab] = useState('notes');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const person = persons.find((item) => item.id === id);

    async function handleDelete() {
        if (!window.confirm(`Delete ${person.name}? This will also delete their notes and wishlist items.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await request(`/api/persons/${id}`, { method: 'DELETE' });
            router.push('/');
        } catch (err) {
            console.error('[PersonDetailPage] Failed to delete person:', err);
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto flex w-full max-w-sm flex-col gap-6 pt-6">
                <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-100" />
                <div className="flex flex-col items-center gap-3">
                    <div className="h-24 w-24 animate-pulse rounded-full bg-neutral-100" />
                    <div className="h-4 w-24 animate-pulse rounded-full bg-neutral-100" />
                </div>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 pt-16 text-center">
                <p className="text-sm text-neutral-500">This person couldn&apos;t be found.</p>
                <Link href="/" className="text-sm font-semibold text-rose-400">
                    Back to home
                </Link>
            </div>
        );
    }

    const tone = getToneForRelationship(person.relationship);
    const birthdayDate = toDate(person.birthday);
    const isProfileIncomplete = !person.birthday;

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 pt-6">
            <header className="flex items-center justify-between">
                <BackButton fallbackHref="/" className="-ml-2" />

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-label="Person options"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition hover:bg-neutral-100"
                    >
                        <MenuIcon />
                    </button>

                    {isMenuOpen ? (
                        <div className="absolute right-0 top-10 z-20 w-40 rounded-xl bg-white p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
                            <Link
                                href={`/persons/${id}/edit`}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 no-underline transition hover:bg-neutral-50"
                            >
                                Edit
                            </Link>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-500 transition hover:bg-rose-50 disabled:opacity-60"
                            >
                                {isDeleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    ) : null}
                </div>
            </header>

            <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                    {person.avatarURL ? (
                        <img src={person.avatarURL} alt={person.name} className="h-24 w-24 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FDEBEA] text-rose-300">
                            <PersonIcon size={38} />
                        </div>
                    )}
                    <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-base leading-none shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
                    >
                        {TONE_BADGE_ICON[tone]}
                    </span>
                </div>

                <div>
                    <h1 className="text-xl font-bold text-neutral-900">{person.name}</h1>
                    {birthdayDate ? (
                        <p className="text-sm text-neutral-500">Birthday: {formatShortDate(birthdayDate)}</p>
                    ) : (
                        <Link href={`/persons/${id}/edit`} className="text-sm font-semibold text-rose-400 no-underline">
                            🎉 Add birthday
                        </Link>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
                {TABS.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                                isActive ? 'bg-rose-400 text-white' : 'bg-white text-neutral-500 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div>
                {(activeTab === 'notes' || activeTab === 'wishlist') && isProfileIncomplete ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-10 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                        <NotebookIcon size={44} />
                        <p className="text-sm font-bold text-neutral-800">No information yet.</p>
                        <p className="text-xs text-neutral-400">
                            Complete their profile first to start saving notes, wishlist, and special moments.
                        </p>
                        <Link
                            href={`/persons/${id}/edit`}
                            className="mt-1 rounded-full bg-rose-400 px-5 py-2 text-xs font-semibold text-white no-underline transition hover:bg-rose-500"
                        >
                            Complete Profile
                        </Link>
                    </div>
                ) : (
                    <>
                        {activeTab === 'notes' ? <PersonNotesTab personId={id} /> : null}
                        {activeTab === 'wishlist' ? <PersonWishlistTab personId={id} /> : null}
                    </>
                )}
                {activeTab === 'ideas' || activeTab === 'moments' ? (
                    <p className="rounded-xl bg-white px-3 py-10 text-center text-xs text-neutral-400 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                        Coming soon.
                    </p>
                ) : null}
            </div>
        </div>
    );
}
