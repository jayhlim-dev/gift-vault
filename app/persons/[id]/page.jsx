'use client';

import { BackButton } from 'components/BackButton';
import {
    CakeIcon,
    GiftIdeasIcon,
    HeartFilledIcon,
    HeartIcon,
    NotebookIcon,
    NotesTabIcon,
    PersonIcon
} from 'components/persons/PersonIcons';
import { PersonNotesTab } from 'components/persons/PersonNotesTab';
import { PersonWishlistTab } from 'components/persons/PersonWishlistTab';
import { formatShortDate, toDate } from 'lib/gift-vault-utils';
import { useApiClient } from 'lib/hooks/useApiClient';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const TABS = [
    { id: 'notes', label: 'Notes', Icon: NotesTabIcon },
    { id: 'wishlist', label: 'Wishlist', Icon: HeartIcon },
    { id: 'ideas', label: 'Gift Ideas', Icon: GiftIdeasIcon }
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

function ProfileEmptyState({ personId }) {
    return (
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-white px-8 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
            <NotebookIcon size={64} />
            <div className="flex flex-col gap-2.5">
                <p className="text-lg font-bold text-neutral-900">No information yet.</p>
                <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                    Complete the profile first to start saving notes, wishlist, and special moments.
                </p>
            </div>
            <Link
                href={`/persons/${personId}/edit`}
                className="mt-1 w-full rounded-full bg-[#D4625A] px-5 py-3.5 text-sm font-semibold text-white no-underline shadow-[0_4px_14px_rgba(212,98,90,0.28)] transition hover:bg-[#c4564f]"
            >
                Complete Profile
            </Link>
        </div>
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
        <div className="mx-auto flex w-full max-w-sm flex-col gap-6 bg-[#FAF8F7] px-5 pt-4 pb-28">
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

                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold text-neutral-900">{person.name}</h2>
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

            <div className="flex flex-wrap items-center justify-center gap-2">
                {TABS.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const TabIcon = tab.Icon;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                                isActive
                                    ? 'bg-[#D4625A] text-white shadow-[0_4px_14px_rgba(212,98,90,0.24)]'
                                    : 'border border-[#F0E8E5] bg-white text-neutral-500 shadow-[0_2px_10px_rgba(0,0,0,0.04)]'
                            }`}
                        >
                            <TabIcon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div>
                {activeTab === 'notes' ? (
                    <PersonNotesTab personId={id} person={person} isProfileIncomplete={isProfileIncomplete} />
                ) : null}
                {activeTab === 'wishlist' && isProfileIncomplete ? (
                    <ProfileEmptyState personId={id} />
                ) : activeTab === 'wishlist' ? (
                    <PersonWishlistTab personId={id} />
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
