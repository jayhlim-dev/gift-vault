'use client';

import { AddNoteModal } from 'components/persons/AddNoteModal';
import { GiftIdeasIcon, NoteFoodIcon, NoteHobbyIcon, NotesTabIcon, PlusIcon } from 'components/persons/PersonIcons';
import { formatRelativeTime, toDate } from 'lib/gift-vault-utils';
import { NOTE_TAGS } from 'lib/note-tags';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import NotesEmptyImage from 'public/images/assets/note-ill.png';
import { useEffect, useRef, useState } from 'react';

const NOTE_CATEGORY_META = {
    'gift-ideas': {
        title: 'Gift Ideas',
        icon: GiftIdeasIcon,
        iconClass: 'text-[#D4625A]'
    },
    'food-drinks': {
        title: 'Food & Drinks',
        icon: NoteFoodIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    allergy: {
        title: 'Allergy & Diet',
        icon: NoteFoodIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    size: {
        title: 'Size',
        icon: NotesTabIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    hobbies: {
        title: 'Hobbies',
        icon: NoteHobbyIcon,
        iconClass: 'text-[#D4625A]'
    },
    other: {
        title: 'Other',
        icon: NotesTabIcon,
        iconClass: 'text-neutral-500'
    },
    favorites: {
        title: 'Favorites',
        icon: NotesTabIcon,
        iconClass: 'text-[#D4625A]'
    }
};

const NOTE_TAG_LABELS = Object.fromEntries(NOTE_TAGS.map((tag) => [tag.id, tag.label]));

const DEFAULT_NOTE_META = {
    title: 'Note',
    icon: NotesTabIcon,
    iconClass: 'text-[#D4625A]'
};

function getNoteMeta(category) {
    if (!category) {
        return DEFAULT_NOTE_META;
    }

    if (NOTE_CATEGORY_META[category]) {
        return NOTE_CATEGORY_META[category];
    }

    const label =
        NOTE_TAG_LABELS[category] ||
        category
            .split('-')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

    return {
        title: label,
        icon: NotesTabIcon,
        iconClass: 'text-[#D4625A]'
    };
}

function ChevronIcon({ expanded = false, size = 16 }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            aria-hidden="true"
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
            <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function getNoteSubtitle(meta, note) {
    const parts = [note.category ? meta.title : 'Note'];

    if (note.isPinned) {
        parts.push('Pinned');
    }

    const time = formatRelativeTime(note.createdAt);
    if (time) {
        parts.push(time);
    }

    return parts.join(' · ');
}

function NoteCard({ note, onEdit }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const textRef = useRef(null);
    const meta = getNoteMeta(note.category);
    const Icon = meta.icon;

    useEffect(() => {
        const element = textRef.current;
        if (!element || isExpanded) {
            return;
        }

        setCanExpand(element.scrollWidth > element.clientWidth || note.text.includes('\n'));
    }, [note.text, isExpanded]);

    function handleToggleExpand(event) {
        event.stopPropagation();
        setIsExpanded((value) => !value);
    }

    const showExpandToggle = canExpand || isExpanded;

    return (
        <li
            className={`rounded-2xl px-4 py-3 text-left shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition ${
                isExpanded ? 'bg-[#FFFCFB]' : 'bg-white'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEA] ${meta.iconClass}`}>
                    <Icon size={20} />
                </div>
                <button
                    type="button"
                    onClick={() => onEdit(note)}
                    className="min-w-0 flex-1 cursor-pointer text-left transition hover:opacity-80"
                >
                    <p
                        ref={textRef}
                        className={`text-sm font-semibold text-neutral-800 ${
                            isExpanded ? 'whitespace-pre-wrap wrap-break-word leading-relaxed' : 'truncate'
                        }`}
                    >
                        {note.text}
                    </p>
                    <p className="mt-0.5 text-2xs text-neutral-500">{getNoteSubtitle(meta, note)}</p>
                </button>
                {showExpandToggle ? (
                    <button
                        type="button"
                        onClick={handleToggleExpand}
                        aria-label={isExpanded ? 'Collapse note' : 'Expand note'}
                        aria-expanded={isExpanded}
                        className="flex h-9 w-9 shrink-0 items-center justify-center self-center rounded-full text-neutral-400 transition hover:bg-[#FDEBEA] hover:text-[#D4625A]"
                    >
                        <ChevronIcon expanded={isExpanded} size={20} />
                    </button>
                ) : null}
            </div>
        </li>
    );
}

export function PersonNotesTab({ personId, person, isProfileIncomplete = false }) {
    const { data: notes, isLoading, refetch } = useFirebaseCollection('notes', { personId });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    function openAddModal() {
        setEditingNote(null);
        setIsModalOpen(true);
    }

    function openEditModal(note) {
        setEditingNote(note);
        setIsModalOpen(true);
    }

    function closeModal() {
        setIsModalOpen(false);
        setEditingNote(null);
    }

    const sortedNotes = notes.slice().sort((a, b) => {
        const pinnedDiff = Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned));
        if (pinnedDiff !== 0) {
            return pinnedDiff;
        }

        return (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0);
    });

    return (
        <>
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <div className="mx-auto h-4 w-28 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                ) : sortedNotes.length ? (
                    <ul className="flex flex-col gap-2">
                        {sortedNotes.map((note) => (
                            <NoteCard key={note.id} note={note} onEdit={openEditModal} />
                        ))}
                    </ul>
                ) : isProfileIncomplete ? (
                    <div className="flex flex-col items-center gap-5 rounded-3xl bg-white px-8 py-12 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <Image src={NotesEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                        <div className="flex flex-col gap-2.5">
                            <p className="text-lg font-bold text-neutral-900">No information yet.</p>
                            <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                                Complete the profile first to start saving notes, wishlist, and special moments.
                            </p>
                        </div>
                        <Link
                            href={`/persons/${personId}/edit`}
                            className="mt-1 w-full rounded-full bg-[#E37377] px-8 py-3.5 text-sm font-semibold text-white no-underline transition hover:bg-[#d9686d]"
                        >
                            Complete Profile
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-8 py-9 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <Image src={NotesEmptyImage} alt="" className="h-32 w-auto object-contain" aria-hidden="true" />
                        <p className="text-lg font-bold text-neutral-900">No notes yet.</p>
                        <p className="mx-auto max-w-68 text-sm leading-relaxed text-neutral-400">
                            Add gift ideas, sizes, allergies, and other details so you always have them on hand.
                        </p>
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-1 w-full rounded-full bg-[#E37377] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#d9686d]"
                        >
                            Add Note
                        </button>
                    </div>
                )}
            </div>

            {!isProfileIncomplete && sortedNotes.length ? (
                <button
                    type="button"
                    onClick={openAddModal}
                    aria-label="Add note"
                    className="fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#9C3D45] text-white shadow-[0_8px_24px_rgba(156,61,69,0.35)] transition hover:bg-[#8B353D]"
                >
                    <PlusIcon size={22} />
                </button>
            ) : null}

            {isModalOpen && person ? (
                <AddNoteModal
                    key={editingNote?.id ?? 'new'}
                    person={person}
                    note={editingNote}
                    onClose={closeModal}
                    onSaved={() => refetch()}
                    onDeleted={() => refetch()}
                />
            ) : null}
        </>
    );
}
