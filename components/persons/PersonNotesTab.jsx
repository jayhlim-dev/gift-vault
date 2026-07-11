'use client';

import { AddNoteModal } from 'components/persons/AddNoteModal';
import { NotePinnedChip, NoteTagChip } from 'components/persons/NoteTagChip';
import {
    GiftIdeasIcon,
    NoteFoodIcon,
    NoteHobbyIcon,
    NoteRestaurantIcon,
    NoteRoutineIcon,
    NoteSkincareIcon,
    NotesTabIcon,
    PlusIcon
} from 'components/persons/PersonIcons';
import { formatRelativeTime, toDate } from 'lib/gift-vault-utils';
import { DEFAULT_NOTE_TAG, NOTE_TAG_ACTIVE_CLASS, getFilterTagsForNotes, getNoteTagLabel } from 'lib/note-tags';
import {
    formatUrlForDisplay,
    getNoteDisplayBody,
    getNoteDisplayTitle,
    isStructuredRestaurantNote,
    noteHasRestaurantLinks
} from 'lib/restaurant-note-utils';
import { isStructuredHobbyNote, noteHasHobbyLinks } from 'lib/hobby-note-utils';
import { useFirebaseCollection } from 'lib/hooks/useFirebaseCollection';
import Image from 'next/image';
import Link from 'next/link';
import NotesEmptyImage from 'public/images/assets/note-ill.png';
import { useEffect, useRef, useState } from 'react';

const NOTE_CATEGORY_META = {
    'food-drinks': {
        title: 'Food & Drinks',
        icon: NoteFoodIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    restaurant: {
        title: 'Restaurant',
        icon: NoteRestaurantIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    'gift-ideas': {
        title: 'Gift Ideas',
        icon: GiftIdeasIcon,
        iconClass: 'text-[#D4625A]'
    },
    hobbies: {
        title: 'Hobbies',
        icon: NoteHobbyIcon,
        iconClass: 'text-[#D4625A]'
    },
    routine: {
        title: 'Routine',
        icon: NoteRoutineIcon,
        iconClass: 'text-[#4A7FA5]'
    },
    other: {
        title: 'Other',
        icon: NotesTabIcon,
        iconClass: 'text-neutral-500'
    },
    skincare: {
        title: 'Skincare',
        icon: NoteSkincareIcon,
        iconClass: 'text-[#D4625A]'
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
    favorites: {
        title: 'Favorites',
        icon: NotesTabIcon,
        iconClass: 'text-[#D4625A]'
    }
};

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

    const label = getNoteTagLabel(category);

    return {
        title: label,
        icon: NotesTabIcon,
        iconClass: 'text-[#D4625A]'
    };
}

function getNoteCategory(note) {
    return note.category || DEFAULT_NOTE_TAG;
}

function NoteTagFilter({ activeTag, onChange, availableTags }) {
    const tags = [
        { id: 'all', label: 'All', className: 'border-[#F0E8E5] bg-[#FAF8F7] text-neutral-600' },
        ...availableTags
    ];

    return (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-neutral-800">Tags</span>
            <div className="flex gap-2 overflow-x-auto px-1 pl-4 py-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#D4625A] rounded-2xl">
                {tags.map((tag) => {
                    const isActive = activeTag === tag.id;
                    return (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => onChange(tag.id)}
                            className={`shrink-0 rounded-full border px-4 py-2 text-xs bg-white font-semibold whitespace-nowrap transition ${
                                isActive ? NOTE_TAG_ACTIVE_CLASS : tag.className
                            }`}
                        >
                            {tag.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
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

function isNotePinned(note) {
    return note?.isPinned === true || note?.isPinned === 'true' || note?.isPinned === 1;
}

function getNoteTimeLabel(note) {
    return formatRelativeTime(note.createdAt) || '';
}

function NoteDetailLine({ label, value, linkable = false, clampLine = false }) {
    const trimmed = value?.trim();
    if (!trimmed) {
        return null;
    }

    const isUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://');
    const displayValue = linkable && isUrl ? formatUrlForDisplay(trimmed) : trimmed;
    const valueClassName = clampLine ? 'min-w-0 truncate' : 'min-w-0 break-all leading-relaxed';

    return (
        <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] items-start gap-x-2 text-2xs">
            <span className="pt-px font-semibold text-neutral-700">{label}</span>
            {linkable && isUrl ? (
                <a
                    href={trimmed}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={trimmed}
                    className={`${valueClassName} block font-medium text-[#D4625A] no-underline`}
                    onClick={(event) => event.stopPropagation()}
                >
                    {displayValue}
                </a>
            ) : (
                <span className={`${valueClassName} text-neutral-600`}>{displayValue}</span>
            )}
        </div>
    );
}

function RestaurantNoteDetails({ note }) {
    if (!isStructuredRestaurantNote(note)) {
        return null;
    }

    const hasNotes = Boolean(note.text?.trim());

    return (
        <div className="mt-3 flex flex-col gap-2 border-t border-[#F0E8E5] pt-3">
            <NoteDetailLine label="Location" value={note.location} linkable clampLine />
            <NoteDetailLine label="Menu" value={note.menuUrl} linkable clampLine />
            <NoteDetailLine label="Instagram" value={note.instagramUrl} linkable clampLine />
            {hasNotes ? (
                <div className="mt-1 border-t border-[#F0E8E5] pt-2">
                    <NoteDetailLine label="Notes" value={note.text} />
                </div>
            ) : null}
        </div>
    );
}

function HobbyNoteDetails({ note }) {
    if (!isStructuredHobbyNote(note)) {
        return null;
    }

    const hasNotes = Boolean(note.text?.trim());

    return (
        <div className="mt-3 flex flex-col gap-2 border-t border-[#F0E8E5] pt-3">
            <NoteDetailLine label="Where" value={note.destination} />
            <NoteDetailLine label="Instagram" value={note.instagramUrl} linkable clampLine />
            {hasNotes ? (
                <div className="mt-1 border-t border-[#F0E8E5] pt-2">
                    <NoteDetailLine label="Notes" value={note.text} />
                </div>
            ) : null}
        </div>
    );
}

function NoteCard({ note, onEdit }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const titleRef = useRef(null);
    const previewRef = useRef(null);
    const category = getNoteCategory(note);
    const meta = getNoteMeta(category);
    const Icon = meta.icon;
    const timeLabel = getNoteTimeLabel(note);
    const pinned = isNotePinned(note);
    const displayTitle = getNoteDisplayTitle(note);
    const displayPreview = getNoteDisplayBody(note);
    const isStructuredRestaurant = isStructuredRestaurantNote(note);
    const isStructuredHobby = isStructuredHobbyNote(note);
    const hasStructuredDetails =
        (isStructuredRestaurant && noteHasRestaurantLinks(note)) || (isStructuredHobby && noteHasHobbyLinks(note));

    useEffect(() => {
        if (isExpanded) {
            return;
        }

        const titleOverflow = titleRef.current ? titleRef.current.scrollWidth > titleRef.current.clientWidth : false;
        const previewOverflow = previewRef.current
            ? previewRef.current.scrollWidth > previewRef.current.clientWidth
            : false;
        const hasHiddenStructuredNotes =
            (isStructuredRestaurant || isStructuredHobby) &&
            Boolean(note.text?.trim()) &&
            note.text.trim() !== displayPreview;

        setCanExpand(
            Boolean(displayPreview) ||
                titleOverflow ||
                previewOverflow ||
                hasStructuredDetails ||
                hasHiddenStructuredNotes
        );
    }, [
        displayPreview,
        displayTitle,
        isExpanded,
        isStructuredHobby,
        isStructuredRestaurant,
        hasStructuredDetails,
        note.text
    ]);

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
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FDEBEA] ${meta.iconClass}`}
                >
                    <Icon size={20} />
                </div>
                <button
                    type="button"
                    onClick={() => onEdit(note)}
                    className="min-w-0 flex-1 cursor-pointer text-left transition hover:opacity-80"
                >
                    <p
                        ref={titleRef}
                        className={`text-sm font-semibold text-neutral-800 ${
                            isExpanded ? 'whitespace-pre-wrap wrap-break-word leading-relaxed' : 'truncate'
                        }`}
                    >
                        {displayTitle}
                    </p>
                    {displayPreview ? (
                        <p
                            ref={previewRef}
                            className={`mt-0.5 text-2xs text-neutral-500 ${
                                isExpanded ? 'whitespace-pre-wrap wrap-break-word leading-relaxed' : 'truncate'
                            }`}
                        >
                            {displayPreview}
                        </p>
                    ) : null}
                    <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">
                        <NoteTagChip label={meta.title} />
                        {pinned ? <NotePinnedChip /> : null}
                        {timeLabel ? <span className="text-2xs text-neutral-500">{timeLabel}</span> : null}
                    </div>
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
            {isExpanded && isStructuredRestaurant ? <RestaurantNoteDetails note={note} /> : null}
            {isExpanded && isStructuredHobby ? <HobbyNoteDetails note={note} /> : null}
        </li>
    );
}

const NOTES_PER_PAGE = 8;

function NotePagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 pt-1">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-full border border-[#F0E8E5] bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-[#FAF8F7] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Previous
            </button>
            <span className="text-xs font-medium text-neutral-500">
                {currentPage} / {totalPages}
            </span>
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-full border border-[#F0E8E5] bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-[#FAF8F7] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Next
            </button>
        </div>
    );
}

export function PersonNotesTab({ personId, person, isProfileIncomplete = false }) {
    const { data: notes, isLoading, refetch } = useFirebaseCollection('notes', { personId });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [activeTag, setActiveTag] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

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
        const pinnedDiff = Number(isNotePinned(b)) - Number(isNotePinned(a));
        if (pinnedDiff !== 0) {
            return pinnedDiff;
        }

        return (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0);
    });

    const usedTagIds = new Set(sortedNotes.map(getNoteCategory));
    const availableTags = getFilterTagsForNotes(usedTagIds);

    useEffect(() => {
        if (activeTag !== 'all' && !usedTagIds.has(activeTag)) {
            setActiveTag('all');
        }
    }, [activeTag, notes]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTag]);

    const filteredNotes =
        activeTag === 'all' ? sortedNotes : sortedNotes.filter((note) => getNoteCategory(note) === activeTag);

    const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PER_PAGE));

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const paginatedNotes = filteredNotes.slice((currentPage - 1) * NOTES_PER_PAGE, currentPage * NOTES_PER_PAGE);

    const hasNotes = sortedNotes.length > 0;
    const showTagFilter = hasNotes && availableTags.length > 1;

    return (
        <>
            <div className="flex flex-col gap-3">
                {isLoading ? (
                    <div className="rounded-3xl bg-white px-6 py-14 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <div className="mx-auto h-4 w-28 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                ) : hasNotes ? (
                    <div className="flex flex-col gap-3">
                        {showTagFilter ? (
                            <NoteTagFilter
                                activeTag={activeTag}
                                onChange={setActiveTag}
                                availableTags={availableTags}
                            />
                        ) : null}

                        {filteredNotes.length ? (
                            <>
                                <ul className="flex flex-col gap-2">
                                    {paginatedNotes.map((note) => (
                                        <NoteCard key={note.id} note={note} onEdit={openEditModal} />
                                    ))}
                                </ul>
                                <NotePagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        ) : (
                            <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                                <p className="text-sm font-semibold text-neutral-800">No notes in this tag.</p>
                                <p className="mt-1 text-xs text-neutral-400">Try another tag or add a new note.</p>
                            </div>
                        )}
                    </div>
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
                            Add gift ideas, restaurants, hobbies, routines, and other details so you always have them on
                            hand.
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

            {!isProfileIncomplete && hasNotes ? (
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
