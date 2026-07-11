'use client';

import { BackButton } from 'components/BackButton';
import {
    CakeIcon,
    GiftIdeasIcon,
    HeartFilledIcon,
    HeartIcon,
    NotesTabIcon,
    PencilIcon,
    PersonIcon,
    RemindersTabIcon
} from 'components/persons/PersonIcons';
import { PersonNotesTab } from 'components/persons/PersonNotesTab';
import { PersonRemindersTab } from 'components/persons/PersonRemindersTab';
import { PersonWishlistTab } from 'components/persons/PersonWishlistTab';
import { formatShortDate, toDate } from 'lib/gift-vault-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { invalidateFirebaseCollectionCaches, useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

const TABS = [
    { id: 'notes', label: 'Notes', Icon: NotesTabIcon },
    { id: 'wishlist', label: 'Wishlist', Icon: HeartIcon },
    { id: 'reminders', label: 'Reminders', Icon: RemindersTabIcon }
];

function MenuIcon() {
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="5" cy="12" r="1.6" fill="currentColor" />
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="19" cy="12" r="1.6" fill="currentColor" />
        </svg>
    );
}

function PersonDetailPageContent() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: persons, isLoading } = useFirebaseCollection('persons');
    const { request } = useApiClient();
    const [activeTab, setActiveTab] = useState('notes');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'notes' || tab === 'wishlist' || tab === 'reminders') {
            setActiveTab(tab);
        }
    }, [searchParams]);

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
        if (
            !window.confirm(`Delete ${person.name}? This will also delete their notes, wishlist items, and reminders.`)
        ) {
            return;
        }

        setIsDeleting(true);
        try {
            await request(`/api/persons/${id}`, { method: 'DELETE' });
            invalidateFirebaseCollectionCaches(['persons', 'notes', 'wishlists', 'reminders']);
            router.push('/');
        } catch (err) {
            console.error('[PersonDetailPage] Failed to delete person:', err);
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 pt-4 pb-28">
                <div className="h-9 w-full animate-pulse rounded-full bg-neutral-100" />
                <div className="flex flex-col items-center gap-3">
                    <div className="h-30 w-30 animate-pulse rounded-full bg-neutral-100" />
                    <div className="h-4 w-24 animate-pulse rounded-full bg-neutral-100" />
                </div>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 px-5 pt-16 pb-28 text-center">
                <p className="text-sm text-neutral-500">This person couldn&apos;t be found.</p>
                <Link href="/" className="text-sm font-semibold text-[#D4625A] no-underline">
                    Back to home
                </Link>
            </div>
        );
    }

    const birthdayDate = toDate(person.birthday);
    const isProfileIncomplete = !person.birthday;

    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 bg-[#FAF8F7] pt-4 pb-28">
            <header className="relative flex items-center justify-center py-1">
                <BackButton fallbackHref="/" className="absolute left-0 -ml-2" />
                <h1 className="text-base font-semibold text-neutral-800">Person Detail</h1>

                <div className="absolute right-0" ref={menuRef}>
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
                                className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#D4625A] transition hover:bg-rose-50 disabled:opacity-60"
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
                        <img src={person.avatarURL} alt={person.name} className="h-30 w-30 rounded-full object-cover" />
                    ) : (
                        <div className="flex h-30 w-30 items-center justify-center rounded-full bg-[#ECE8E6] text-neutral-400">
                            <PersonIcon size={42} />
                        </div>
                    )}
                    <span
                        aria-hidden="true"
                        className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#D4625A] text-white shadow-[0_2px_8px_rgba(212,98,90,0.35)]"
                    >
                        <HeartFilledIcon size={14} />
                    </span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center gap-1">
                        <Link
                            href={`/persons/${id}/edit`}
                            aria-label="Edit profile"
                            className="flex h-8  items-center justify-center rounded-full text-[#D4625A] no-underline transition hover:bg-[#FDEBEA]"
                        >
                            <h2 className="text-xl font-bold text-neutral-900">{person.name}</h2>
                            {/* <PencilIcon size={16} /> */}
                        </Link>
                    </div>
                    {isProfileIncomplete ? (
                        <>
                            <p className="text-sm text-neutral-400">Not filled yet</p>
                            <Link
                                href={`/persons/${id}/edit`}
                                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#D4625A] no-underline transition hover:text-[#c4564f]"
                            >
                                <CakeIcon size={16} />
                                Add birthday
                            </Link>
                        </>
                    ) : (
                        <p className="text-sm text-neutral-500">Birthday: {formatShortDate(birthdayDate)}</p>
                    )}
                </div>
            </div>

            <div
                role="tablist"
                aria-label="Person sections"
                className="flex rounded-2xl bg-white p-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
            >
                {TABS.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const TabIcon = tab.Icon;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition ${
                                isActive
                                    ? 'bg-[#D4625A] text-white shadow-[0_4px_14px_rgba(212,98,90,0.24)]'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            <TabIcon size={14} />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div role="tabpanel">
                {activeTab === 'notes' ? (
                    <PersonNotesTab personId={id} person={person} isProfileIncomplete={isProfileIncomplete} />
                ) : null}
                {activeTab === 'wishlist' ? (
                    <PersonWishlistTab personId={id} person={person} isProfileIncomplete={isProfileIncomplete} />
                ) : null}
                {activeTab === 'reminders' ? (
                    <PersonRemindersTab personId={id} person={person} isProfileIncomplete={isProfileIncomplete} />
                ) : null}
                {activeTab === 'ideas' ? (
                    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <GiftIdeasIcon size={44} />
                        <p className="text-sm font-bold text-neutral-800">Gift ideas coming soon.</p>
                        <p className="text-xs text-neutral-400">We&apos;re working on AI-powered gift suggestions.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function PersonDetailPageFallback() {
    return (
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-5 pt-4 pb-28">
            <div className="h-9 w-full animate-pulse rounded-full bg-neutral-100" />
            <div className="flex flex-col items-center gap-3">
                <div className="h-30 w-30 animate-pulse rounded-full bg-neutral-100" />
                <div className="h-4 w-24 animate-pulse rounded-full bg-neutral-100" />
            </div>
        </div>
    );
}

export default function PersonDetailPage() {
    return (
        <Suspense fallback={<PersonDetailPageFallback />}>
            <PersonDetailPageContent />
        </Suspense>
    );
}
